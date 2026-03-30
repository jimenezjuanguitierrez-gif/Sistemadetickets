import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/AppError.js';

export const obtenerTodosLosUsuarios = async () => {
  const users = await prisma.user.findMany({
    orderBy: { fechaCreacion: 'desc' },
  });
  return users.map(({ password, ...user }) => user);
};

/**
 * Soft-delete: desactiva el usuario sin borrar su historial.
 * Reglas:
 *   - Nadie puede darse de baja a sí mismo.
 *   - ADMIN puede dar de baja a USER y PROFESOR (no a otros ADMIN).
 *   - PROFESOR solo puede dar de baja a USER (alumnos).
 */
export const eliminarUsuario = async (targetId, requestingUser) => {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) throw AppError.notFound('Usuario no encontrado');

  // No puede borrarse a sí mismo
  if (requestingUser.id === targetId) {
    throw AppError.badRequest('No podés darte de baja a vos mismo');
  }

  // ADMIN no puede dar de baja a otro ADMIN
  if (target.rol === 'ADMIN') {
    throw AppError.forbidden('No se puede dar de baja a un administrador');
  }

  // PROFESOR solo puede dar de baja a alumnos (USER)
  if (requestingUser.rol === 'PROFESOR' && target.rol !== 'USER') {
    throw AppError.forbidden('Los profesores solo pueden dar de baja a alumnos');
  }

  // Si ya está inactivo, informar
  if (!target.activo) {
    throw AppError.badRequest('El usuario ya está dado de baja');
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data:  { activo: false },
  });

  const { password, ...user } = updated;
  return { message: `${target.nombre} fue dado de baja correctamente`, user };
};