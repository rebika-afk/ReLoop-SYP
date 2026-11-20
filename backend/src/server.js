import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/prisma.js';

const PORT = env.PORT;

const server = app.listen(PORT, async () => {
  console.log(`[ReLoop Server] Running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(`[ReLoop Server] API available at http://localhost:${PORT}/api/v1`);
  console.log(`[ReLoop Server] CORS allowlisted origin: ${env.CLIENT_URL}`);

  try {
    // Attempt non-blocking connection check to database
    await prisma.$connect();
    console.log('[ReLoop Server] Database connected successfully.');
  } catch (err) {
    console.warn('[ReLoop Server] Database connection warning:', err.message);
    console.warn('[ReLoop Server] Please ensure PostgreSQL is running and DATABASE_URL is valid.');
  }
});

const handleShutdown = async (signal) => {
  console.log(`\n[ReLoop Server] ${signal} received. Closing HTTP server and disconnecting DB...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('[ReLoop Server] Database disconnected. Process exiting cleanly.');
    } catch (err) {
      console.error('[ReLoop Server] Error during shutdown:', err);
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default server;

