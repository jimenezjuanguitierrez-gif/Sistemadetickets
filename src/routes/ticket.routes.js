import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as ticketController from '../controllers/ticket.controller.js';

const router = Router();

// Cualquier autenticado puede crear y ver sus propios tickets
router.post('/',        authenticate, ticketController.crearTicket);
router.get('/mios',     authenticate, ticketController.obtenerMisTickets);

// Tickets por computadora — cualquier usuario autenticado (necesario para los hubs)
router.get('/computadora/:pcId', authenticate, ticketController.obtenerTicketsPorPC);

// Todos los tickets — ADMIN y PROFESOR
router.get('/', authenticate, authorize('ADMIN', 'PROFESOR'), ticketController.obtenerTodosLosTickets);

// Cambiar estado y eliminar — ADMIN y PROFESOR
router.put('/:id/estado', authenticate, authorize('ADMIN', 'PROFESOR'), ticketController.cambiarEstado);
router.delete('/:id',     authenticate, authorize('ADMIN', 'PROFESOR'), ticketController.eliminarTicket);

export default router;
