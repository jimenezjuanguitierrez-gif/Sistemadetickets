import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/AppError.js';

const ESTADOS_VALIDOS = ['ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];

export const crearTicket = async (data, usuarioId) => {
  const { titulo, descripcion, prioridad, computadoraId } = data;

  if (!titulo || titulo.trim() === '') {
    throw AppError.badRequest('El título es obligatorio');
  }

  if (!descripcion || descripcion.trim() === '') {
    throw AppError.badRequest('La descripción es obligatoria');
  }

  const ticket = await prisma.ticket.create({
    data: {
      titulo:        titulo.trim(),
      descripcion:   descripcion.trim(),
      prioridad:     prioridad ?? 'MEDIA',
      creadoPorId:   usuarioId,
      computadoraId: computadoraId ?? null,
    },
    include: {
      creadoPor: { select: { id: true, nombre: true, email: true, rol: true } },
      computadora: { select: { id: true, codigo: true, nombre: true } },
    },
  });

  // Registrar en historial
  await prisma.historial.create({
    data: {
      accion:      'CREADO',
      descripcion: `Ticket "${titulo}" creado`,
      ticketId:    ticket.id,
      usuarioId,
    },
  });

  return ticket;
};

export const obtenerMisTickets = async (usuarioId) => {
  return await prisma.ticket.findMany({
    where: { creadoPorId: usuarioId },
    include: {
      computadora: true,
      creadoPor:   { select: { id: true, nombre: true, email: true, rol: true } },
      asignadoA:   { select: { id: true, nombre: true, email: true } },
    },
    orderBy: { fechaCreacion: 'desc' },
  });
};

export const obtenerTicketsPorPC = async (computadoraId) => {
  return await prisma.ticket.findMany({
    where: { computadoraId },
    include: {
      creadoPor: { select: { id: true, nombre: true, email: true, rol: true } },
    },
    orderBy: { fechaCreacion: 'asc' },
  });
};

export const obtenerTodosLosTickets = async () => {
  return await prisma.ticket.findMany({
    include: {
      computadora: true,
      creadoPor:   { select: { id: true, nombre: true, email: true, rol: true } },
      asignadoA:   { select: { id: true, nombre: true, email: true } },
    },
    orderBy: { fechaCreacion: 'desc' },
  });
};

export const cambiarEstado = async (ticketId, nuevoEstado, usuarioId) => {
  if (!nuevoEstado) {
    throw AppError.badRequest('El estado es obligatorio');
  }

  if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
    throw AppError.badRequest(
      `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`
    );
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw AppError.notFound('Ticket no encontrado');

  const ticketActualizado = await prisma.ticket.update({
    where: { id: ticketId },
    data:  { estado: nuevoEstado },
  });

  await prisma.historial.create({
    data: {
      accion:      'CAMBIO_ESTADO',
      descripcion: `Estado cambiado de ${ticket.estado} a ${nuevoEstado}`,
      ticketId,
      usuarioId,
    },
  });

  return ticketActualizado;
};

export const eliminarTicket = async (ticketId, usuarioId) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw AppError.notFound('Ticket no encontrado');

  // Primero eliminar el historial asociado al ticket (FK RESTRICT)
  await prisma.historial.deleteMany({ where: { ticketId } });

  // Luego eliminar el ticket
  await prisma.ticket.delete({ where: { id: ticketId } });

  return { message: 'Ticket eliminado correctamente' };
};