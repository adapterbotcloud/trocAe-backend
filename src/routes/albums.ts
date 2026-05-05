import { FastifyInstance } from 'fastify';
import { prisma } from '../db/index';

export async function albumRoutes(app: FastifyInstance) {
  // GET /albums
  app.get('/', async () => {
    const albums = await prisma.album.findMany({
      select: {
        id: true,
        name: true,
        totalFigurinhas: true,
        coverUrl: true,
        isDefault: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return { albums };
  });

  // GET /albums/:id
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        categories: { select: { id: true, name: true } },
      },
    });

    if (!album) {
      return reply.status(404).send({ error: 'Album not found' });
    }

    return reply.send(album);
  });

  // GET /albums/:id/figurinhas
  app.get('/:id/figurinhas', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { categoria, raridade } = request.query as { categoria?: string; raridade?: string };

    const where: Record<string, unknown> = { albumId: id };
    if (categoria) where.categoryId = categoria;
    if (raridade) where.raridade = raridade;

    const figurinhas = await prisma.figurinha.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { numero: 'asc' },
    });

    return reply.send({ figurinhas });
  });

  // GET /figurinhas/search
  app.get('/figurinhas/search', async (request, reply) => {
    const { numero, album, time, raridade } = request.query as {
      numero?: string;
      album?: string;
      time?: string;
      raridade?: string;
    };

    const where: Record<string, unknown> = {};
    if (numero) where.numero = numero;
    if (album) where.albumId = album;
    if (raridade) where.raridade = raridade;
    if (time) {
      where.nome = { contains: time, mode: 'insensitive' };
    }

    const figurinhas = await prisma.figurinha.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        album: { select: { id: true, name: true } },
      },
      take: 50,
    });

    return reply.send({ figurinhas });
  });
}