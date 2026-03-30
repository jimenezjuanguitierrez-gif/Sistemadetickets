import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as ticketController from '../controllers/ticket.controller.js';

const router = Router();

// Crear ticket — cualquier usuario autenticado
router.post('/', authenticate, ticketController.crearTicket);

// Mis tickets
router.get('/mios', authenticate, ticketController.obtenerMisTickets);

// Tickets por computadora — cualquier usuario autenticado
router.get('/computadora/:id', authenticate, ticketController.obtenerTicketsPorPC);

// Todos los tickets — ADMIN y PROFESOR
router.get('/', authenticate, authorize('ADMIN', 'PROFESOR'), ticketController.obtenerTodosLosTickets);

// Cambiar estado — ADMIN y PROFESOR
router.put('/:id/estado', authenticate, authorize('ADMIN', 'PROFESOR'), ticketController.cambiarEstado);

// Eliminar ticket — ADMIN y PROFESOR
router.delete('/:id', authenticate, authorize('ADMIN', 'PROFESOR'), ticketController.eliminarTicket);

export default router;