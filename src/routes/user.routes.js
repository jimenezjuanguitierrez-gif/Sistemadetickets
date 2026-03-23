import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), userController.obtenerUsuarios);

export default router;