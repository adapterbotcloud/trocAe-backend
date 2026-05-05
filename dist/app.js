"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const cors_1 = __importDefault(require("@fastify/cors"));
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function buildApp() {
    const app = (0, fastify_1.default)({ logger: true });
    await app.register(cors_1.default, { origin: true });
    await app.register(jwt_1.default, { secret: process.env.JWT_SECRET || 'trocae-jwt-secret-change-in-production' });
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
//# sourceMappingURL=app.js.map