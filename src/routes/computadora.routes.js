import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as ctrl from '../controllers/computadora.controller.js';

const router = Router();

// Cualquier usuario autenticado puede ver las PCs
router.get('/',    authenticate, ctrl.obtenerComputadoras);
router.get('/:id', authenticate, ctrl.obtenerComputadora);

// Crear/eliminar: solo ADMIN
router.post('/',    authenticate, authorize('ADMIN'), ctrl.crearComputadora);
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.eliminarComputadora);

// Actualizar: ADMIN y PROFESOR (para cambiar el estado de la PC)
router.put('/:id', authenticate, authorize('ADMIN', 'PROFESOR'), ctrl.actualizarComputadora);

export default router;