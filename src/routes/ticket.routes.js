import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as ticketController from '../controllers/ticket.controller.js';

const router = Router();

router.post('/', authenticate, ticketController.crearTicket);
router.get('/mios', authenticate, ticketController.obtenerMisTickets);
router.get('/', authenticate, authorize('ADMIN'), ticketController.obtenerTodosLosTickets);
router.put('/:id/estado', authenticate, authorize('ADMIN'), ticketController.cambiarEstado);
router.delete('/:id', authenticate, authorize('ADMIN'), ticketController.eliminarTicket);

export default router;