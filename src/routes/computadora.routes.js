import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as ctrl from '../controllers/computadora.controller.js';

const router = Router();

// Cualquier usuario autenticado puede ver las PCs
router.get('/',    authenticate, ctrl.obtenerComputadoras);
router.get('/:id', authenticate, ctrl.obtenerComputadora);

// Crear, actualizar y eliminar: ADMIN y PROFESOR
// Los profesores son los responsables diarios del sistema
router.post('/',      authenticate, authorize('ADMIN', 'PROFESOR'), ctrl.crearComputadora);
router.put('/:id',    authenticate, authorize('ADMIN', 'PROFESOR'), ctrl.actualizarComputadora);
router.delete('/:id', authenticate, authorize('ADMIN', 'PROFESOR'), ctrl.eliminarComputadora);

export default router;
