// src/app.js
// Express application factory. Intentionally separated from server.js.
//
// WHY app.js ≠ server.js:
// app.js exports the configured Express instance without starting the HTTP server.
// This separation is critical for testing: test suites can import `app` and use
// supertest without binding to a real port — enabling parallel, isolated tests.
// server.js is the runtime entrypoint; app.js is the testable unit.

import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

const app = express();

// ─── Core Middlewares ─────────────────────────────────────────────────────────

// Parse incoming JSON bodies. Limit prevents payload-based DoS attacks.
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies (for potential form submissions)
app.use(express.urlencoded({ extended: true }));

// CORS: in production, restrict `origin` to your actual frontend domain.
// Keeping it configurable here avoids hardcoding and simplifies deployment.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/api', apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────

// All routes are prefixed with /api — standard convention that:
// 1. Clearly differentiates API endpoints from potential static file serving
// 2. Allows versioning later without breaking existing clients (/api/v2/...)
// 3. Makes API gateway / reverse proxy rules simple and unambiguous
app.use('/api', router);

// ─── Error Handling ───────────────────────────────────────────────────────────

// Order matters in Express. notFound must come after routes (catches unmatched),
// and errorHandler must be last (receives errors forwarded via next(err)).
app.use(notFound);
app.use(errorHandler);

export default app;