// src/config/prisma.js
// Exports a single PrismaClient instance shared across the entire app.
//
// WHY A SINGLETON:
// PrismaClient manages a connection pool internally. Instantiating it multiple
// times (e.g., once per service file) would open unnecessary connections and
// exhaust database limits quickly — critical issue in school environments with
// limited infrastructure.
//
// The global trick prevents re-instantiation during hot reloads in development
// (nodemon), which would otherwise leak connections on every file save.

import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev() ? ['query', 'warn', 'error'] : ['error'],
  });

if (env.isDev()) globalForPrisma.prisma = prisma;