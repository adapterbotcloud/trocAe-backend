"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.buildApp = buildApp;
exports.authenticate = authenticate;
const jwt_1 = __importDefault(require("@fastify/jwt"));
const cors_1 = __importDefault(require("@fastify/cors"));
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function buildApp() {
    const app = Fastify({ logger: true });
    await app.register(cors_1.default, { origin: true });
    await app.register(jwt_1.default, { secret: process.env.JWT_SECRET || 'trocae-jwt-secret' });
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
function authenticate(app) {
    return async function (request, reply) {
        try {
            await request.jwtVerify();
        }
        catch {
            reply.status(401).send({ error: 'Unauthorized' });
        }
    };
}
//# sourceMappingURL=index.js.map