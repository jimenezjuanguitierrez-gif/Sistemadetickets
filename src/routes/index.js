import { Router } from 'express';
import authRouter from './auth.routes.js';
import ticketRouter from './ticket.routes.js';
import userRouter from './user.routes.js';
import computadoraRouter  from './computadora.routes.js';

const router = Router();

// ─── Health check ─────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Help Desk API running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Rutas de dominio ─────────────────────────────────────────────────────────
router.use('/auth', authRouter);
router.use('/tickets', ticketRouter);
router.use('/users', userRouter);
router.use('/computadoras', computadoraRouter);

export default router;