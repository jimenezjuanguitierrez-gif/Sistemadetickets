# PC Forum — Comandos de instalación y puesta en marcha
## Guía completa desde cero para cualquier servidor nuevo

---

## Requisitos previos

- **Node.js v20 o superior** → https://nodejs.org
- **PostgreSQL 14 o superior** → https://www.postgresql.org/download/
- **Git** (opcional, para clonar) → https://git-scm.com

---

## 1 — Obtener el proyecto

### Opción A: Clonar desde Git
```bash
git clone <URL-del-repositorio> pcforum
cd pcforum
```

### Opción B: Copiar desde pendrive / carpeta
```bash
# Copiar la carpeta del proyecto a donde quieras y entrar en ella
cd /ruta/al/proyecto
```

---

## 2 — Instalar dependencias de Node

```bash
npm install
```

---

## 3 — Configurar la base de datos en PostgreSQL

### Crear la base de datos (una sola vez)
Conectarse a PostgreSQL como superusuario y ejecutar:

```sql
-- En psql o pgAdmin:
CREATE DATABASE helpdesk_db;
```

En Windows con psql desde la terminal:
```bash
psql -U postgres -c "CREATE DATABASE helpdesk_db;"
```

---

## 4 — Configurar las variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Editar `.env` con los datos reales:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/helpdesk_db"

JWT_SECRET=una_clave_larga_y_secreta_minimo_32_caracteres
JWT_EXPIRES_IN=7d
```

> **Importante:** Reemplazá `TU_PASSWORD` por la contraseña de tu usuario PostgreSQL.

---

## 5 — Generar el cliente Prisma

```bash
npm run prisma:generate
```

---

## 6 — Aplicar las migraciones (crear las tablas)

```bash
npm run prisma:migrate
```

> Cuando pregunte el nombre de la migración, escribí cualquier nombre (ej. `init`) y Enter.

---

## 7 — Crear el usuario Admin inicial

```bash
node seed-admin.js
```

Esto crea:
| Campo | Valor |
|-------|-------|
| Email | `admin@pcforum.edu` |
| Contraseña | `admin123` |

> ⚠️ Cambiá la contraseña del admin después del primer ingreso.

---

## 8 — Iniciar el servidor en desarrollo

```bash
npm run dev
```

Esto hace **dos cosas a la vez**:
1. Arranca el servidor con recarga automática (nodemon)
2. Abre `http://localhost:3000` en el navegador automáticamente

---

## 9 — Acceder al sistema

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000` | Login (página principal) |
| `http://localhost:3000/api/health` | Estado del servidor (verificación rápida) |

---

## Secuencia completa (copia y pegá todo junto en una terminal nueva)

```bash
npm install
cp .env.example .env
# EDITÁ .env ANTES DE CONTINUAR
npm run prisma:generate
npm run prisma:migrate
node seed-admin.js
npm run dev
```

---

## Comandos de uso diario

```bash
# Iniciar en desarrollo (con hot-reload + abre el navegador)
npm run dev

# Iniciar en producción (sin nodemon, sin abrir navegador)
npm start

# Regenerar el cliente Prisma (después de cambiar schema.prisma)
npm run prisma:generate

# Aplicar una nueva migración a la BD
npm run prisma:migrate

# Abrir Prisma Studio (UI visual de la BD en el navegador)
npm run prisma:studio

# Recrear el admin (si se perdió o cambió la contraseña)
node seed-admin.js
```

---

## Cambiar a otro servidor / IP de red escolar

Si el servidor tiene una IP fija (ej. `192.168.0.31`), los usuarios acceden con:
```
http://192.168.0.31:3000
```

No hace falta cambiar ningún archivo del proyecto.
Solo asegurate de que el puerto 3000 esté habilitado en el firewall del servidor.

**En Windows (PowerShell como Administrador):**
```powershell
New-NetFirewallRule -DisplayName "PC Forum" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

**En Linux/Ubuntu:**
```bash
sudo ufw allow 3000/tcp
```

---

## Configurar para que arranque automáticamente con el sistema

### Windows — con PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Arrancar la app con PM2
pm2 start src/server.js --name pcforum

# Guardar la configuración para que sobreviva reinicios
pm2 save

# Registrar PM2 como servicio de Windows
pm2 startup
# (Ejecutar el comando que PM2 te indique)
```

Comandos útiles de PM2:
```bash
pm2 status          # Ver estado de todos los procesos
pm2 logs pcforum    # Ver logs en tiempo real
pm2 restart pcforum # Reiniciar la app
pm2 stop pcforum    # Detener la app
```

### Linux/Ubuntu — con PM2

```bash
npm install -g pm2
pm2 start src/server.js --name pcforum
pm2 save
pm2 startup systemd
# Ejecutar el comando sudo que PM2 te muestra
```

---

## Backup de la base de datos

```bash
# Crear backup
pg_dump -U postgres helpdesk_db > backup_$(date +%Y-%m-%d).sql

# Restaurar desde backup
psql -U postgres -d helpdesk_db < backup_2024-01-15.sql
```

---

## Solución de problemas frecuentes

| Error | Causa probable | Solución |
|-------|---------------|----------|
| `Can't reach database server` | PostgreSQL no está corriendo | Iniciar el servicio de PostgreSQL |
| `Invalid prisma.schema` | Falta `npm run prisma:generate` | Ejecutar `npm run prisma:generate` |
| `Port 3000 already in use` | Otro proceso usa el puerto | Cambiar `PORT` en `.env` o matar el proceso |
| `Missing required environment variable` | Falta el archivo `.env` | Crear `.env` desde `.env.example` |
| `JWT_SECRET` error | `.env` no tiene JWT_SECRET | Agregar `JWT_SECRET=cualquier_texto_largo` al `.env` |
| El navegador no abre solo | Problema con el sistema operativo | Abrir `http://localhost:3000` manualmente |

---

## Para despliegue con Docker (producción)

Ver el archivo `MANUAL-INSTALACION-WINDOWS-SERVER.md` para el procedimiento completo con Docker Compose.

Resumen rápido:
```bash
cp .env.example .env
# Editar .env con las contraseñas de producción
docker compose up -d
```

---

*PC Forum v1.0 — ET N° 20 D.E. 20 "Carolina Muzilli"*
