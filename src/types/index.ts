import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

export { Raridade } from '@prisma/client';

export interface JwtPayload {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

export type FastifyInstanceWithPlugins = FastifyInstance;

export interface TradeMatch {
  type: 'PERFEITA' | 'PARCIAL' | 'GRUPO';
  users: Array<{
    id: string;
    name: string;
    lat?: number | null;
    lng?: number | null;
  }>;
  trades: Array<{
    figurinhaNumero: string;
    figurinhaNome: string;
    direction: 'OFFER' | 'REQUEST';
  }>;
  distanceKm?: number;
}
