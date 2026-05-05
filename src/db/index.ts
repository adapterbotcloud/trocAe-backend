import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { albumRoutes } from './routes/albums.js';
import { inventoryRoutes } from './routes/inventory.js';
import { tradeRoutes } from './routes/trades.js';
import { chatRoutes } from './routes/chats.js';

export const prisma = new PrismaClient();

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(fastifyCors, { origin: true });
  await app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'trocae-jwt-secret' });

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Register routes
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(albumRoutes, { prefix: '/albums' });
  await app.register(inventoryRoutes, { prefix: '/inventory' });
  await app.register(tradeRoutes, { prefix: '/trades' });
  await app.register(chatRoutes, { prefix: '/chats' });

  return app;
}
