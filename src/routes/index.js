import { Router } from 'express';
import authRouter from './auth.routes.js';
import { prisma } from '../config/prisma.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import ticketRouter from './ticket.routes.js';

const router = Router();

// ─── Health check ────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Help Desk API running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Ruta protegida (requiere JWT + rol ADMIN) ───────────────────────────────
router.get('/users', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    // 🔐 Ocultar password
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    res.json({
      success: true,
      userLogged: req.user,
      data: usersWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuarios',
    });
  }
});

// ─── Rutas públicas ──────────────────────────────────────────────────────────
router.use('/tickets', ticketRouter);
router.use('/auth', authRouter);

console.log("authRouter:", authRouter);

export default router;