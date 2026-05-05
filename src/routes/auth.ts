import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { prisma } from '../db/index';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  whatsapp: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return reply.status(400).send({ error: 'Email já cadastrado' });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        whatsapp: body.whatsapp,
        lat: body.lat,
        lng: body.lng,
      },
    });

    const token = app.jwt.sign({ id: user.id, email: user.email });

    return reply.status(201).send({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  });

  // POST /auth/login
  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }

    const token = app.jwt.sign({ id: user.id, email: user.email });

    return reply.send({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  });
}