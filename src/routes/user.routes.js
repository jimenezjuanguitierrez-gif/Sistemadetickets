import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// Listar usuarios — ADMIN y PROFESOR
router.get('/', authenticate, authorize('ADMIN', 'PROFESOR'), userController.obtenerUsuarios);

// Dar de baja un usuario — ADMIN y PROFESOR (con restricciones de rol en el servicio)
router.delete('/:id', authenticate, authorize('ADMIN', 'PROFESOR'), userController.eliminarUsuario);

export default router;