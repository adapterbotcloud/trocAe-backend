import { FastifyInstance } from 'fastify';
import { prisma } from '../db/index';
import { z } from 'zod';

const createChatSchema = z.object({
  user1Id: z.string(),
  user2Id: z.string(),
});

const sendMessageSchema = z.object({
  senderId: z.string(),
  content: z.string().min(1).max(1000),
});

export async function chatRoutes(app: FastifyInstance) {
  // GET /chats — list chats for authenticated user
  app.get('/', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const payload = request.user as { id: string };
    const userId = payload.id;

    const chats = await prisma.chat.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: { select: { id: true, name: true } },
        user2: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ chats });
  });

  // POST /chats — create a chat
  app.post('/', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { user1Id, user2Id } = createChatSchema.parse(request.body);

    // Upsert: if exists, return existing
    const existing = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id },
        ],
      },
    });

    if (existing) return reply.send(existing);

    const chat = await prisma.chat.create({
      data: { user1Id, user2Id },
      include: {
        user1: { select: { id: true, name: true } },
        user2: { select: { id: true, name: true } },
      },
    });

    return reply.status(201).send(chat);
  });

  // GET /chats/:id/messages
  app.get('/:id/messages', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { id } = request.params as { id: string };
    const payload = request.user as { id: string };

    const chat = await prisma.chat.findUnique({ where: { id } });
    if (!chat) return reply.status(404).send({ error: 'Chat not found' });
    if (chat.user1Id !== payload.id && chat.user2Id !== payload.id) {
      return reply.status(403).send({ error: 'Not your chat' });
    }

    const messages = await prisma.message.findMany({
      where: { chatId: id },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send({ messages });
  });

  // POST /chats/:id/messages — send message
  app.post('/:id/messages', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { id } = request.params as { id: string };
    const { senderId, content } = sendMessageSchema.parse(request.body);
    const payload = request.user as { id: string };

    if (senderId !== payload.id) return reply.status(403).send({ error: 'Not your senderId' });

    const chat = await prisma.chat.findUnique({ where: { id } });
    if (!chat) return reply.status(404).send({ error: 'Chat not found' });
    if (chat.user1Id !== payload.id && chat.user2Id !== payload.id) {
      return reply.status(403).send({ error: 'Not your chat' });
    }

    const message = await prisma.message.create({
      data: { chatId: id, senderId, content },
      include: { sender: { select: { id: true, name: true } } },
    });

    return reply.status(201).send(message);
  });
}