// src/middlewares/errorHandler.js
// Global error handling middleware. Must be registered LAST in app.js (Express convention).
//
// WHY CENTRALIZE ERRORS:
// Without this, each controller would need its own try/catch + res.status(...).json(...)
// logic, leading to inconsistent error shapes across the API. A single handler
// guarantees a uniform response contract that the frontend can always rely on.
//
// Operational errors (expected, e.g. "ticket not found") vs programmer errors
// (unexpected, e.g. null reference) are treated differently: operational ones
// expose a message; programmer ones return a generic 500 to avoid leaking internals.

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational ?? false;

  // Never expose raw stack traces or internal messages in production
  const message =
    isOperational || process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error';

  if (!isOperational) {
    // Log unexpected errors for observability (swap with a real logger later)
    console.error('[Unhandled Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};