import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/AppError.js';

export const obtenerTodosLosUsuarios = async () => {
  const users = await prisma.user.findMany({
    orderBy: { fechaCreacion: 'desc' },
  });
  // Nunca exponer el password
  return users.map(({ password, ...user }) => user);
};

/**
 * Anonimiza un usuario en lugar de eliminarlo físicamente.
 *
 * POR QUÉ ANONIMIZAR Y NO BORRAR:
 * Los tickets e historial tienen FK hacia User. Si borramos el registro,
 * perderíamos todo el rastro de actividad. La anonimización preserva
 * integridad referencial y cumplimiento de auditoría, pero elimina todos
 * los datos personales identificables (nombre, email, contraseña).
 *
 * El email se reemplaza por uno interno único → libera el email real
 * para que alguien más pueda registrarse con él.
 */
export const eliminarUsuario = async (idObjetivo, idAdmin) => {
  const user = await prisma.user.findUnique({ where: { id: idObjetivo } });

  if (!user) throw AppError.notFound('Usuario no encontrado');

  // No se puede dar de baja a otro admin
  if (user.rol === 'ADMIN') {
    throw AppError.forbidden('No se puede dar de baja a un administrador');
  }

  // No se puede dar de baja a uno mismo (el admin que hace la petición)
  if (idObjetivo === idAdmin) {
    throw AppError.forbidden('No podés darte de baja a vos mismo');
  }

  // Si ya fue anonimizado, no hacer nada
  if (user.email.startsWith('eliminado_') && user.email.endsWith('@sistema.local')) {
    throw AppError.conflict('El usuario ya fue dado de baja');
  }

  // Password aleatorio para que nadie pueda acceder con la cuenta fantasma
  const passwordAleatorio = await bcrypt.hash(`${Math.random()}-${Date.now()}`, 10);

  await prisma.user.update({
    where: { id: idObjetivo },
    data: {
      nombre:   'Usuario Eliminado',
      email:    `eliminado_${idObjetivo}_${Date.now()}@sistema.local`,
      password: passwordAleatorio,
      activo:   false,
    },
  });

  return { message: 'Usuario dado de baja y datos personales eliminados' };
};
