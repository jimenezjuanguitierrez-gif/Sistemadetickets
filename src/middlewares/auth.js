// src/middlewares/auth.js
// JWT verification middleware. Attaches the decoded payload to req.user.
//
// WHY HERE AND NOT IN CONTROLLERS:
// Auth is a cross-cutting concern — it applies to many routes regardless of domain.
// Keeping it as middleware allows routes to declare their protection requirements
// declaratively (router.use(authenticate)) instead of repeating the logic per controller.
//
// The role check is separated into its own factory (authorize) so it can be
// composed independently: some routes need auth but no specific role,
// others need both.

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
};

// Role-based authorization factory
// Usage: router.get('/admin', authenticate, authorize('ADMIN'), handler)
export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(AppError.forbidden('Insufficient permissions'));
    }
    next();
  };
};