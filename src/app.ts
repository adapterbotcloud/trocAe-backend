import { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(fastifyCors, { origin: true });
  await app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'trocae-jwt-secret-change-in-production' });

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Register routes
  await import('./routes/auth.js').then(m => app.register(m.authRoutes, { prefix: '/auth' }));
  await import('./routes/users.js').then(m => app.register(m.userRoutes, { prefix: '/users' }));
  await import('./routes/albums.js').then(m => app.register(m.albumRoutes, { prefix: '/albums' }));
  await import('./routes/inventory.js').then(m => app.register(m.inventoryRoutes, { prefix: '/inventory' }));
  await import('./routes/trades.js').then(m => app.register(m.tradeRoutes, { prefix: '/trades' }));
  await import('./routes/chats.js').then(m => app.register(m.chatRoutes, { prefix: '/chats' }));

  return app;
}