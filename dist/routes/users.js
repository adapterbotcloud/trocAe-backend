"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = userRoutes;
const index_js_1 = require("../db/index.js");
async function userRoutes(app) {
    // GET /users/me
    app.get('/me', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
        const payload = request.user;
        const user = await index_js_1.prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, name: true, email: true, whatsapp: true, lat: true, lng: true, createdAt: true },
        });
        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }
        return reply.send(user);
    });
    // PUT /users/me/location
    app.put('/me/location', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
        const payload = request.user;
        const body = request.body;
        const user = await index_js_1.prisma.user.update({
            where: { id: payload.id },
            data: { lat: body.lat, lng: body.lng },
            select: { id: true, name: true, email: true, lat: true, lng: true },
        });
        return reply.send(user);
    });
    // PUT /users/me (generic - name and whatsapp)
    app.put('/me', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
        const payload = request.user;
        const { name, whatsapp } = request.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (whatsapp !== undefined)
            updateData.whatsapp = whatsapp || null;
        const user = await index_js_1.prisma.user.update({
            where: { id: payload.id },
            data: updateData,
            select: { id: true, name: true, email: true, whatsapp: true },
        });
        return reply.send(user);
    });
}
//# sourceMappingURL=users.js.map