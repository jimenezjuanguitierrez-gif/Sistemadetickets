import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/AppError.js';

export const crearTicket = async (data, usuarioId) => {
  const ticket = await prisma.ticket.create({
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion,
      prioridad: data.prioridad ?? 'MEDIA',
      creadoPorId: usuarioId,
      computadoraId: data.computadoraId ?? null,
    },
    include: { creadoPor: { select: { id: true, nombre: true, email: true } } }
  });

  await prisma.historial.create({
    data: {
      accion: 'CREADO',
      descripcion: `Ticket creado por el usuario ${usuarioId}`,
      ticketId: ticket.id,
      usuarioId,
    }
  });

  return ticket;
};

export const obtenerMisTickets = async (usuarioId) => {
  return await prisma.ticket.findMany({
    where: { creadoPorId: usuarioId },
    include: {
      computadora: true,
      creadoPor: { select: { id: true, nombre: true, email: true } },
      asignadoA: { select: { id: true, nombre: true, email: true } },
    },
    orderBy: { fechaCreacion: 'desc' }
  });
};

export const obtenerTodosLosTickets = async () => {
  return await prisma.ticket.findMany({
    include: {
      computadora: true,
      creadoPor: { select: { id: true, nombre: true, email: true } },
      asignadoA: { select: { id: true, nombre: true, email: true } },
    },
    orderBy: { fechaCreacion: 'desc' }
  });
};

export const cambiarEstado = async (ticketId, nuevoEstado, usuarioId) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

  if (!ticket) throw AppError.notFound('Ticket no encontrado');

  const ticketActualizado = await prisma.ticket.update({
    where: { id: ticketId },
    data: { estado: nuevoEstado },
  });

  await prisma.historial.create({
    data: {
      accion: 'CAMBIO_ESTADO',
      descripcion: `Estado cambiado de ${ticket.estado} a ${nuevoEstado}`,
      ticketId,
      usuarioId,
    }
  });

  return ticketActualizado;
};

export const eliminarTicket = async (ticketId, usuarioId) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

  if (!ticket) throw AppError.notFound('Ticket no encontrado');

  await prisma.historial.create({
    data: {
      accion: 'ELIMINADO',
      descripcion: `Ticket eliminado por el usuario ${usuarioId}`,
      ticketId,
      usuarioId,
    }
  });

  await prisma.ticket.delete({ where: { id: ticketId } });

  return { message: 'Ticket eliminado correctamente' };
};