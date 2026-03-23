import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';

/**
 * Middleware de autenticación
 * Verifica el JWT y adjunta el payload en req.user
 */
export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(AppError.unauthorized('Token inválido'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return next(AppError.unauthorized('Token inválido o expirado'));
  }
};

/**
 * Middleware de autorización por roles
 * Uso: authorize('ADMIN') o authorize('ADMIN', 'MOD')
 */
export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('No autenticado'));
    }

    if (!roles.includes(req.user.rol)) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    next();
  };
};
