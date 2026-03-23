// src/middlewares/AppError.js
// Custom error class that carries HTTP context.
//
// WHY A CUSTOM ERROR CLASS:
// Native Error objects have no concept of HTTP status codes.
// By extending Error, we can throw semantically meaningful errors from any layer
// (service, controller) and let the global errorHandler respond correctly
// without duplicating res.status() calls everywhere.
//
// The isOperational flag distinguishes expected domain errors (404, 401, 422)
// from unexpected programmer errors — a pattern from production Node.js systems.

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request') {
    return new AppError(message, 400);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Conflict') {
    return new AppError(message, 409);
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500, false);
  }
}