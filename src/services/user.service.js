import { prisma } from '../config/prisma.js';

export const obtenerTodosLosUsuarios = async () => {
  const users = await prisma.user.findMany({
    orderBy: { fechaCreacion: 'desc' },
  });

  return users.map(({ password, ...user }) => user);
};