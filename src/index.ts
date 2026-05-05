import { buildApp } from './app.js';

const PORT = parseInt(process.env.PORT || '3001');

async function main() {
  const app = await buildApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 TrocAê API running on port ${PORT}`);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});