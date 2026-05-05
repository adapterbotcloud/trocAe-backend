import { FastifyInstance } from 'fastify';
import { prisma } from '../db/index.js';

export async function userRoutes(app: FastifyInstance) {
  // GET /users/me
  app.get('/me', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const payload = request.user as { id: string; email: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, whatsapp: true, lat: true, lng: true, createdAt: true },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send(user);
  });

  // PUT /users/me/location
  app.put('/me/location', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const payload = request.user as { id: string; email: string };
    const body = request.body as { lat: number; lng: number };

    const user = await prisma.user.update({
      where: { id: payload.id },
      data: { lat: body.lat, lng: body.lng },
      select: { id: true, name: true, email: true, lat: true, lng: true },
    });

    return reply.send(user);
  });
}