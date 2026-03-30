import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/AppError.js';
import { env } from '../config/env.js';

export const register = async (data) => {
  const { nombre, email, password, rol } = data;

  if (!nombre || nombre.trim() === '') {
    throw AppError.badRequest('El nombre es obligatorio');
  }

  if (!email || !password) {
    throw AppError.badRequest('Email y password son obligatorios');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw AppError.conflict('El email ya está registrado');
  }

  // Solo se permiten PROFESOR y USER desde el registro público; ADMIN solo por seed
  const rolAsignado = rol === 'PROFESOR' ? 'PROFESOR' : 'USER';

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      nombre:   nombre.trim(),
      email,
      password: hashedPassword,
      rol:      rolAsignado,
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

  // No distinguir entre email incorrecto y contraseña incorrecta (anti-enumeración)
  if (!user) throw AppError.unauthorized('Credenciales incorrectas');

  // Verificar que la cuenta esté activa
  if (!user.activo) {
    throw AppError.unauthorized('Tu cuenta fue desactivada. Contactá al administrador.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw AppError.unauthorized('Credenciales incorrectas');

  const token = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};