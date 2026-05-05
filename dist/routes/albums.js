"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.albumRoutes = albumRoutes;
const index_js_1 = require("../db/index.js");
async function albumRoutes(app) {
    // GET /albums
    app.get('/', async () => {
        const albums = await index_js_1.prisma.album.findMany({
            select: {
                id: true,
                name: true,
                totalFigurinhas: true,
                coverUrl: true,
                isDefault: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        return { albums };
    });
    // GET /albums/:id
    app.get('/:id', async (request, reply) => {
        const { id } = request.params;
        const album = await index_js_1.prisma.album.findUnique({
            where: { id },
            include: {
                categories: { select: { id: true, name: true } },
            },
        });
        if (!album) {
            return reply.status(404).send({ error: 'Album not found' });
        }
        return reply.send(album);
    });
    // GET /albums/:id/figurinhas
    app.get('/:id/figurinhas', async (request, reply) => {
        const { id } = request.params;
        const { categoria, raridade } = request.query;
        const where = { albumId: id };
        if (categoria)
            where.categoryId = categoria;
        if (raridade)
            where.raridade = raridade;
        const figurinhas = await index_js_1.prisma.figurinha.findMany({
            where,
            include: { category: { select: { id: true, name: true } } },
            orderBy: { numero: 'asc' },
        });
        return reply.send({ figurinhas });
    });
    // GET /figurinhas/search
    app.get('/figurinhas/search', async (request, reply) => {
        const { numero, album, time, raridade } = request.query;
        const where = {};
        if (numero)
            where.numero = numero;
        if (album)
            where.albumId = album;
        if (raridade)
            where.raridade = raridade;
        if (time) {
            where.nome = { contains: time, mode: 'insensitive' };
        }
        const figurinhas = await index_js_1.prisma.figurinha.findMany({
            where,
            include: {
                category: { select: { id: true, name: true } },
                album: { select: { id: true, name: true } },
            },
            take: 50,
        });
        return reply.send({ figurinhas });
    });
}
//# sourceMappingURL=albums.js.map