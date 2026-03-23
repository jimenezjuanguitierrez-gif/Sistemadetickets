// src/routes/index.js
// Central route aggregator. All domain routers are mounted here, then
// this single file is imported into app.js.
//
// WHY AN AGGREGATOR:
// app.js should stay clean and unaware of domain details. Adding a new resource
// (e.g., /tickets, /users) means touching only this file — not app.js.
// This follows the Open/Closed principle: app is open for extension via this
// file, closed for modification.

import { Router } from 'express';

const router = Router();

// ─── Health check ────────────────────────────────────────────────────────────
// Exposed at /api/health — used by load balancers, monitoring tools, and CI
// pipelines to verify the service is alive without touching business logic.
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Help Desk API running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Domain routes (add as features are built) ───────────────────────────────
// import authRouter from './auth.routes.js';
// import ticketRouter from './ticket.routes.js';
// import userRouter from './user.routes.js';

// router.use('/auth', authRouter);
// router.use('/tickets', ticketRouter);
// router.use('/users', userRouter);

export default router;