import { FastifyInstance } from 'fastify';
import { prisma } from '../db/index';
import type { TradeStatus } from '@prisma/client';
import { z } from 'zod';

const findTradesSchema = z.object({
  userId: z.string(),
  albumId: z.string().optional(),
  radiusKm: z.number().optional(),
});

const proposeTradeSchema = z.object({
  proposerId: z.string(),
  receiverId: z.string(),
  items: z.array(z.object({
    figurinhaId: z.string(),
    direction: z.enum(['OFFER', 'REQUEST']),
  })),
});

// Haversine distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function tradeRoutes(app: FastifyInstance) {
  // POST /trades/find — matching engine
  app.post('/find', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { userId, albumId, radiusKm } = findTradesSchema.parse(request.body);

    // Get user's faltantes and repetidas
    const myInventory = await prisma.inventory.findMany({
      where: { userId, quantity: { gt: 0 } },
      include: { figurinha: true },
    });

    const myFaltantes = myInventory.filter((i) => i.quantity === 0).map((i) => i.figurinhaId);
    const myRepetidas = myInventory.filter((i) => i.quantity > 1).map((i) => i.figurinhaId);

    if (myFaltantes.length === 0 && myRepetidas.length === 0) {
      return reply.send({ matches: [], summary: 'Sem figurinhas para trocar' });
    }

    // Build where clause for other users
    const userFilter: Record<string, unknown> = { id: { not: userId } };
    if (albumId) {
      // Only figurinhas from this album
    }

    // Find other users who have what I want (my faltantes)
    const othersWithMyWants = await prisma.inventory.findMany({
      where: {
        userId: { not: userId },
        status: 'REPETIDA',
        figurinhaId: { in: myFaltantes },
        ...(albumId ? { figurinha: { albumId } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, lat: true, lng: true } },
        figurinha: { select: { id: true, numero: true, nome: true } },
      },
    });

    // Find other users who want what I have (my repetidas)
    const othersWantMyRepetidas = await prisma.inventory.findMany({
      where: {
        userId: { not: userId },
        status: 'FALTANTE',
        figurinhaId: { in: myRepetidas },
        ...(albumId ? { figurinha: { albumId } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, lat: true, lng: true } },
        figurinha: { select: { id: true, numero: true, nome: true } },
      },
    });

    const matches: Array<{
      type: string;
      user: { id: string; name: string; lat?: number | null; lng?: number | null };
      theyHave: Array<{ figurinhaId: string; numero: string; nome: string }>;
      theyWant: Array<{ figurinhaId: string; numero: string; nome: string }>;
      distanceKm?: number;
    }> = [];

    // Group by other user
    const otherUsersMap = new Map<string, typeof othersWithMyWants[0] & typeof othersWantMyRepetidas[0]>();

    for (const item of othersWithMyWants) {
      const existing = otherUsersMap.get(item.user.id) || {} as typeof item;
      if (!existing.theyHave) existing.theyHave = [];
      existing.theyHave?.push({ figurinhaId: item.figurinha.id, numero: item.figurinha.numero, nome: item.figurinha.nome });
      existing.user = item.user;
      otherUsersMap.set(item.user.id, existing);
    }

    for (const item of othersWantMyRepetidas) {
      const existing = otherUsersMap.get(item.user.id) || {} as typeof item;
      if (!existing.theyWant) existing.theyWant = [];
      existing.theyWant?.push({ figurinhaId: item.figurinha.id, numero: item.figurinha.numero, nome: item.figurinha.nome });
      existing.user = item.user;
      otherUsersMap.set(item.user.id, existing);
    }

    for (const [, data] of otherUsersMap) {
      const theyHave = (data as any).theyHave || [];
      const theyWant = (data as any).theyWant || [];
      if (theyHave.length === 0 && theyWant.length === 0) continue;

      let distanceKm: number | undefined;
      const myUser = await prisma.user.findUnique({ where: { id: userId }, select: { lat: true, lng: true } });
      if (myUser?.lat && myUser?.lng && data.user.lat && data.user.lng) {
        distanceKm = haversine(myUser.lat, myUser.lng, data.user.lat, data.user.lng);
        if (radiusKm && distanceKm > radiusKm) continue;
      }

      const hasBoth = theyHave.length > 0 && theyWant.length > 0;
      matches.push({
        type: hasBoth ? 'PERFEITA' : 'PARCIAL',
        user: data.user,
        theyHave,
        theyWant,
        ...(distanceKm ? { distanceKm: Math.round(distanceKm * 10) / 10 } : {}),
      });
    }

    // Sort: PERFEITA first, then by distance
    matches.sort((a, b) => {
      if (a.type === 'PERFEITA' && b.type !== 'PERFEITA') return -1;
      if (b.type === 'PERFEITA' && a.type !== 'PERFEITA') return 1;
      return (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999);
    });

    return reply.send({ matches });
  });

  // POST /trades/propose
  app.post('/propose', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { proposerId, receiverId, items } = proposeTradeSchema.parse(request.body);

    const trade = await prisma.trade.create({
      data: {
        proposerId,
        receiverId,
        tradeItems: {
          create: items.map((item) => ({
            userId: item.direction === 'OFFER' ? proposerId : receiverId,
            figurinhaId: item.figurinhaId,
            direction: item.direction,
          })),
        },
      },
      include: {
        tradeItems: { include: { figurinha: { select: { numero: true, nome: true } } } },
        proposer: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    return reply.status(201).send(trade);
  });

  // POST /trades/:id/accept
  app.post('/:id/accept', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { id } = request.params as { id: string };
    const payload = request.user as { id: string };

    const trade = await prisma.trade.findUnique({ where: { id } });
    if (!trade) return reply.status(404).send({ error: 'Trade not found' });
    if (trade.receiverId !== payload.id) return reply.status(403).send({ error: 'Not your trade' });
    if (trade.status !== 'PENDENTE') return reply.status(400).send({ error: 'Trade not pending' });

    // Execute the trade: update inventory
    const tradeItems = await prisma.tradeItem.findMany({ where: { tradeId: id } });

    for (const item of tradeItems) {
      if (item.direction === 'OFFER') {
        // Giver loses 1
        await prisma.inventory.updateMany({
          where: { userId: item.userId, figurinhaId: item.figurinhaId },
          data: { quantity: { decrement: 1 } },
        });
      } else {
        // Receiver gains 1
        await prisma.inventory.updateMany({
          where: { userId: item.userId, figurinhaId: item.figurinhaId },
          data: { quantity: { increment: 1 } },
        });
      }
    }

    const updated = await prisma.trade.update({
      where: { id },
      data: { status: 'ACEITA' },
    });

    return reply.send(updated);
  });

  // GET /trades/history
  app.get('/history', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const payload = request.user as { id: string };
    const trades = await prisma.trade.findMany({
      where: { OR: [{ proposerId: payload.id }, { receiverId: payload.id }] },
      include: {
        tradeItems: { include: { figurinha: { select: { numero: true, nome: true } } } },
        proposer: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ trades });
  });
}