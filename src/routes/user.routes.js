import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// Solo ADMIN puede listar y dar de baja usuarios
router.get('/',     authenticate, authorize('ADMIN'), userController.obtenerUsuarios);
router.delete('/:id', authenticate, authorize('ADMIN'), userController.eliminarUsuario);

export default router;
