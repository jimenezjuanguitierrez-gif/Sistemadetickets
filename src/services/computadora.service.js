import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/AppError.js';

export const obtenerComputadoras = async () => {
  return await prisma.computadora.findMany({
    include: {
      _count: { select: { tickets: true } },
    },
    orderBy: { nombre: 'asc' },
  });
};

export const obtenerComputadora = async (id) => {
  const pc = await prisma.computadora.findUnique({
    where: { id },
    include: {
      _count: { select: { tickets: true } },
    },
  });
  if (!pc) throw AppError.notFound('Computadora no encontrada');
  return pc;
};

export const crearComputadora = async (data) => {
  const { codigo, nombre, lab, ubicacion, descripcion, marca, modelo, procesador, ram, disco, os, estado } = data;

  if (!codigo || codigo.trim() === '') throw AppError.badRequest('El código es obligatorio');
  if (!nombre  || nombre.trim() === '')  throw AppError.badRequest('El nombre es obligatorio');

  const existe = await prisma.computadora.findUnique({ where: { codigo } });
  if (existe) throw AppError.conflict(`Ya existe una computadora con el código ${codigo}`);

  return await prisma.computadora.create({
    data: {
      codigo:      codigo.trim(),
      nombre:      nombre.trim(),
      lab:         lab         ?? 'otros',
      ubicacion:   ubicacion   ?? '',
      descripcion: descripcion ?? '',
      marca:       marca       ?? '',
      modelo:      modelo      ?? '',
      procesador:  procesador  ?? '',
      ram:         ram         ?? '',
      disco:       disco       ?? '',
      os:          os          ?? '',
      estado:      estado      ?? 'ok',
    },
  });
};

export const actualizarComputadora = async (id, data) => {
  const pc = await prisma.computadora.findUnique({ where: { id } });
  if (!pc) throw AppError.notFound('Computadora no encontrada');

  // Si el código cambia, verificar unicidad
  if (data.codigo && data.codigo !== pc.codigo) {
    const existe = await prisma.computadora.findUnique({ where: { codigo: data.codigo } });
    if (existe) throw AppError.conflict(`Ya existe una computadora con el código ${data.codigo}`);
  }

  return await prisma.computadora.update({
    where: { id },
    data,
  });
};

export const eliminarComputadora = async (id) => {
  const pc = await prisma.computadora.findUnique({ where: { id } });
  if (!pc) throw AppError.notFound('Computadora no encontrada');

  // Eliminar historial de tickets asociados, luego tickets, luego la PC
  const tickets = await prisma.ticket.findMany({ where: { computadoraId: id } });
  const ticketIds = tickets.map(t => t.id);

  if (ticketIds.length > 0) {
    await prisma.historial.deleteMany({ where: { ticketId: { in: ticketIds } } });
    await prisma.ticket.deleteMany({ where: { computadoraId: id } });
  }

  await prisma.computadora.delete({ where: { id } });
  return { message: 'Computadora eliminada correctamente' };
};