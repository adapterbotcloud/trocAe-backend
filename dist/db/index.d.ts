import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function buildApp(): Promise<FastifyInstance>;
export declare function authenticate(app: FastifyInstance): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
//# sourceMappingURL=index.d.ts.map