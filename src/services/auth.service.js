import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/AppError.js';
import { env } from '../config/env.js';

export const register = async (data) => {
  const { nombre, email, password,rol } = data;

  if (!email || !password) {
    throw new AppError('Email y password son obligatorios', 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('El usuario ya existe', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
  data: {
    nombre,
    email,
    password: hashedPassword,
    rol: rol || 'user', // si no manda rol → user
  },
});

  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const login = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError('Email y password son obligatorios', 400);
  }

  // 1. Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  // 2. Comparar password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError('Credenciales inválidas', 401);
  }

  // 3. Generar JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      rol: user.rol,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  // 4. Remover password
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};
