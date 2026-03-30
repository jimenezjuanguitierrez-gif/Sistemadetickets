import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// ─── Core Middlewares ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/api', apiLimiter);

// ─── Servir Frontend estático ─────────────────────────────────────────────────
// Sirve los HTML/CSS/JS del Frontend desde la misma instancia Express.
// Esto elimina problemas de CORS y simplifica el deploy (un solo proceso).
const frontendPath = path.join(__dirname, '..', 'Frontend');
app.use(express.static(frontendPath));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', router);

// ─── Fallback: cualquier ruta no-API sirve index.html ─────────────────────────
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
