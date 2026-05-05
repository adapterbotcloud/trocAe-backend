"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const PORT = parseInt(process.env.PORT || '3001');
async function main() {
    const app = await (0, app_js_1.buildApp)();
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 TrocAê API running on port ${PORT}`);
}
main().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map