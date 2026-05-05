import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(fastifyCors, { origin: true });
  await app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'trocae-jwt-secret' });

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Import and register routes
  const { authRoutes } = await import('./routes/auth.js');
  const { userRoutes } = await import('./routes/users.js');
  const { albumRoutes } = await import('./routes/albums.js');
  const { inventoryRoutes } = await import('./routes/inventory.js');
  const { tradeRoutes } = await import('./routes/trades.js');
  const { chatRoutes } = await import('./routes/chats.js');

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(albumRoutes, { prefix: '/albums' });
  await app.register(inventoryRoutes, { prefix: '/inventory' });
  await app.register(tradeRoutes, { prefix: '/trades' });
  await app.register(chatRoutes, { prefix: '/chats' });

  return app;
}

export function authenticate(app: FastifyInstance) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  };
}