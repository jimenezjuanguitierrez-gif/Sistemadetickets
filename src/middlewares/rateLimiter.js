// src/middlewares/rateLimiter.js
// Define dos límites distintos:
// - authLimiter: muy estricto, para login y register (protege contra fuerza bruta)
// - apiLimiter: general, para el resto de la API
import rateLimit from 'express-rate-limit';
// Límite para autenticación:
// Máximo 10 intentos por IP en 15 minutos.
// Si alguien falla 10 veces, espera 15 minutos antes de intentar de nuevo.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos en milisegundos
    max: 10, // máximo 10 requests
    message: {
        success: false,
        message: 'Demasiados intentos. Intentá de nuevo en 15 minutos.',
    },
    standardHeaders: true, // incluye info del límite en los headers
    legacyHeaders: false,
});
// Límite general para la API:
// Máximo 100 requests por IP en 1 minuto.
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 100,
    message: {
        success: false,
        message: 'Demasiadas solicitudes. Intentá en un momento.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
