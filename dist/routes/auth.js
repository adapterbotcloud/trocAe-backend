"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const bcrypt_1 = __importDefault(require("bcrypt"));
const index_js_1 = require("../db/index.js");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    whatsapp: zod_1.z.string().optional(),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
async function authRoutes(app) {
    // POST /auth/register
    app.post('/register', async (request, reply) => {
        const body = registerSchema.parse(request.body);
        const existing = await index_js_1.prisma.user.findUnique({ where: { email: body.email } });
        if (existing) {
            return reply.status(400).send({ error: 'Email já cadastrado' });
        }
        const passwordHash = await bcrypt_1.default.hash(body.password, 10);
        const user = await index_js_1.prisma.user.create({
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
        const user = await index_js_1.prisma.user.findUnique({ where: { email: body.email } });
        if (!user) {
            return reply.status(401).send({ error: 'Credenciais inválidas' });
        }
        const valid = await bcrypt_1.default.compare(body.password, user.passwordHash);
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
//# sourceMappingURL=auth.js.map