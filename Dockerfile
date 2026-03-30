# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Copiar manifiestos de dependencias primero (mejor caché de capas)
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las deps (necesitamos prisma CLI para generate)
RUN npm ci

# Generar el cliente de Prisma para la plataforma del contenedor
RUN npx prisma generate

# Copiar el resto del código
COPY src ./src/
COPY Frontend ./Frontend/
COPY seed-admin.js ./

# ─── Runtime ─────────────────────────────────────────────────────────────────
EXPOSE 3000

# El entrypoint aplica migraciones, siembra el admin (si no existe) y arranca el servidor.
# Se usa un script shell para encadenar los pasos de forma limpia.
CMD ["sh", "-c", "npx prisma migrate deploy && node seed-admin.js && node src/server.js"]
