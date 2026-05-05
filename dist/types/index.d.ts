import { FastifyInstance, FastifyRequest } from 'fastify';
import { Raridade, InventoryStatus, TradeStatus } from '@prisma/client';
export { Raridade, InventoryStatus, TradeStatus };
export interface JwtPayload {
    id: string;
    email: string;
}
export interface AuthenticatedRequest extends FastifyRequest {
    user: JwtPayload;
}
export type FastifyInstanceWithPlugins = FastifyInstance;
export interface FigurinhaWithCategory extends Figurinha {
    category?: Category | null;
}
export interface InventoryWithFigurinha extends Inventory {
    figurinha: Figurinha;
}
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
//# sourceMappingURL=index.d.ts.map