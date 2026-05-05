import { FastifyInstance } from 'fastify';
import { prisma, InventoryStatus } from '../db/index.js';

export async function inventoryRoutes(app: FastifyInstance) {
  // GET /inventory — get all 3 lists for the authenticated user
  app.get('/', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const payload = request.user as { id: string };
    const userId = payload.id;

    const items = await prisma.inventory.findMany({
      where: { userId },
      include: {
        figurinha: {
          include: {
            album: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    const tenho = items.filter((i) => i.quantity >= 1);
    const repetidas = items.filter((i) => i.quantity > 1);
    const faltantes = await prisma.figurinha.findMany({
      where: {
        albumId: (await prisma.album.findFirst({ where: { isDefault: true } }))?.id ?? '',
        NOT: { id: { in: items.map((i) => i.figurinhaId) } },
      },
      include: {
        album: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return reply.send({ tenho, repetidas, faltantes });
  });

  // PUT /inventory/:figurinhaId — update quantity / status
  app.put('/:figurinhaId', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const payload = request.user as { id: string };
    const { figurinhaId } = request.params as { figurinhaId: string };
    const body = request.body as { quantity: number; status?: InventoryStatus };

    const inventory = await prisma.inventory.upsert({
      where: { userId_figurinhaId: { userId: payload.id, figurinhaId } },
      create: {
        userId: payload.id,
        figurinhaId,
        quantity: body.quantity,
        status: body.status ?? (body.quantity === 0 ? 'FALTANTE' : body.quantity > 1 ? 'REPETIDA' : 'TENHO'),
      },
      update: {
        quantity: body.quantity,
        status: body.status ?? (body.quantity === 0 ? 'FALTANTE' : body.quantity > 1 ? 'REPETIDA' : 'TENHO'),
      },
      include: {
        figurinha: {
          include: {
            album: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    return reply.send(inventory);
  });
}