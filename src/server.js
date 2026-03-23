// src/server.js
// Runtime entrypoint — only responsibility is to start the HTTP server.
//
// WHY ASYNC STARTUP:
// Prisma connection validation (or any async init like cache warming, feature flags)
// must complete before accepting traffic. An async IIFE gives us a clean await
// chain and a single place to handle startup failures gracefully.
//
// Unhandled rejection / uncaught exception handlers are the last line of defense:
// they ensure the process exits with a non-zero code (triggering restarts in
// process managers like PM2 or container orchestrators like Kubernetes).

import './config/env.js'; // Validate env vars before anything else
import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const start = async () => {
  // Validate database connectivity at startup.
  // Fails fast: better to crash immediately than to serve requests that will
  // all fail at the DB layer seconds later.
  await prisma.$connect();
  console.log('✅ Database connection established');

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Help Desk API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────
  // On SIGTERM/SIGINT (Docker stop, Ctrl+C, PM2 restart), stop accepting new
  // connections, wait for in-flight requests to complete, then close DB connections.
  // Prevents data corruption and dropped requests during deployments.
  const shutdown = async (signal) => {
    console.log(`\n⚡ ${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('💤 Server and database connections closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// ─── Process-level Error Guards ───────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

start().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});