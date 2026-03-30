import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/AppError.js';
import { env } from '../config/env.js';

// Roles que se pueden elegir al registrarse (ADMIN solo via seed)
const ROLES_REGISTRABLES = ['USER', 'PROFESOR'];

export const register = async (data) => {
  const { nombre, email, password, rol } = data;

  if (!nombre || nombre.trim() === '') {
    throw AppError.badRequest('El nombre es obligatorio');
  }

  if (!email || !password) {
    throw AppError.badRequest('Email y password son obligatorios');
  }

  // Validar rol — nunca dejar que el cliente asigne ADMIN
  const rolFinal = ROLES_REGISTRABLES.includes(rol) ? rol : 'USER';

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw AppError.conflict('El email ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      nombre: nombre.trim(),
      email,
      password: hashedPassword,
      rol: rolFinal,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const login = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw AppError.badRequest('Email y password son obligatorios');
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.activo) {
    // No distinguir entre "email inexistente" y "contraseña incorrecta" (anti-enumeración)
    throw AppError.unauthorized('Credenciales incorrectas');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw AppError.unauthorized('Credenciales incorrectas');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
  