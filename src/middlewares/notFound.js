// src/middlewares/notFound.js
// Catches any request that didn't match a registered route and forwards
// a structured 404 error to the global errorHandler.
//
// WHY NOT HANDLE IN errorHandler DIRECTLY:
// Express only calls the 4-argument error handler when next(err) is called.
// Unmatched routes fall through silently unless we explicitly catch them here.
// This middleware acts as a "catch-all" safety net at the bottom of the route stack.

import { AppError } from './AppError.js';

export const notFound = (req, _res, next) => {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};