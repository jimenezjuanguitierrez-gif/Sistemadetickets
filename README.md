# Sistema de Gestión de Tickets — Help Desk API

**Backend v1.0** | ET N° 20 D.E. 20 "Carolina Muzilli"

Sistema de gestión de incidencias técnicas para el seguimiento del estado de computadoras en aulas de la especialidad TICs y Multimedia. Permite a usuarios autenticados reportar fallas y a administradores gestionar el ciclo de vida completo de cada incidencia.

---

## Stack tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Runtime | Node.js (ESM) | v24.x |
| Framework | Express | 4.22.x |
| ORM | Prisma | 5.22.x |
| Base de datos | PostgreSQL | 16.x |
| Autenticación | JWT + bcryptjs | 9.0.x / 2.4.x |

---

## Estructura del proyecto

```
src/
├── config/
│   ├── env.js              # Acceso centralizado a variables de entorno con validación
│   └── prisma.js           # Singleton de PrismaClient (evita múltiples connection pools)
├── controllers/            # Capa HTTP: parseo de request, llamada a service, envío de response
│   ├── auth.controller.js
│   ├── ticket.controller.js
│   └── user.controller.js
├── services/               # Lógica de negocio pura: validaciones, reglas de dominio, acceso a DB
│   ├── auth.service.js
│   ├── ticket.service.js
│   └── user.service.js
├── routes/
│   ├── index.js            # Agregador de rutas — monta todos los routers bajo /api
│   ├── auth.routes.js
│   ├── ticket.routes.js
│   └── user.routes.js
├── middlewares/
│   ├── AppError.js         # Clase de error custom con statusCode e isOperational
│   ├── auth.js             # authenticate (JWT) + authorize(...roles)
│   ├── errorHandler.js     # Handler global de errores (último middleware)
│   └── notFound.js         # Catch-all 404 para rutas no registradas
├── app.js                  # Express app factory — separado de server.js para testing
└── server.js               # Entrypoint HTTP + graceful shutdown + process guards
prisma/
├── schema.prisma           # Modelos: User, Computadora, Ticket, Historial
└── migrations/             # Historial de migraciones SQL aplicadas
```

---

## Responsabilidades por capa

| Capa | Responsabilidad | Lo que NO debe hacer |
|------|----------------|---------------------|
| `routes` | Declarar endpoints y aplicar middlewares | Contener lógica |
| `controllers` | Parseo HTTP entrada/salida, llamar services | Contener reglas de negocio |
| `services` | Lógica de negocio, acceso a DB vía Prisma | Conocer req/res de HTTP |
| `middlewares` | Auth, errores, concerns globales | Contener lógica de dominio |
| `config` | Configuración y clientes externos | Contener lógica de negocio |

---

## Instalación local (desarrollo)

### Prerequisitos

- Node.js v18 o superior
- PostgreSQL 14 o superior corriendo localmente

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/sistemadetickets.git
cd sistemadetickets

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (ver sección Variables de entorno)

# 4. Generar el cliente de Prisma
npm run prisma:generate

# 5. Aplicar las migraciones a la base de datos
npm run prisma:migrate

# 6. Iniciar el servidor en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3000/api/health`

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Servidor
NODE_ENV=development
PORT=3000

# Base de datos (ajustar credenciales)
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/helpdesk_db"

# JWT
JWT_SECRET=clave_secreta_muy_larga_minimo_32_caracteres
JWT_EXPIRES_IN=7d
```

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | ✅ | String de conexión a PostgreSQL |
| `JWT_SECRET` | ✅ | Clave para firmar los tokens JWT |
| `JWT_EXPIRES_IN` | ❌ | Expiración del token (default: `7d`) |
| `PORT` | ❌ | Puerto HTTP (default: `3000`) |
| `NODE_ENV` | ❌ | Entorno (`development` / `production`) |
| `CORS_ORIGIN` | ❌ | Origen CORS permitido (default: `*`) |

---

## API REST — Endpoints

### Públicos (sin autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Estado del servidor |
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | Iniciar sesión — retorna JWT |

### Autenticados (requieren `Authorization: Bearer <token>`)

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `POST` | `/api/tickets` | USER / ADMIN | Crear ticket |
| `GET` | `/api/tickets/mios` | USER / ADMIN | Ver mis tickets |
| `GET` | `/api/tickets` | ADMIN | Ver todos los tickets |
| `PUT` | `/api/tickets/:id/estado` | ADMIN | Cambiar estado |
| `DELETE` | `/api/tickets/:id` | ADMIN | Eliminar ticket |
| `GET` | `/api/users` | ADMIN | Listar usuarios |
| `GET` | `/api/computadoras` | USER / ADMIN | Listar computadoras *(Sprint 2)* |
| `POST` | `/api/computadoras` | ADMIN | Registrar computadora *(Sprint 2)* |

### Códigos de respuesta

| Código | Cuándo se retorna |
|--------|------------------|
| `200` | Operación exitosa (consultas, login) |
| `201` | Recurso creado exitosamente |
| `400` | Campos faltantes o datos inválidos |
| `401` | Token ausente, inválido o credenciales incorrectas |
| `403` | Rol insuficiente para el recurso |
| `404` | Ruta o recurso no encontrado |
| `409` | Email ya registrado |
| `500` | Error inesperado del servidor |

---

## Modelo de datos

```
User          Ticket          Computadora
─────         ──────          ───────────
id            id              id
nombre        titulo          codigo (único)
email (único) descripcion     ubicacion
password      estado          descripcion
rol           prioridad
activo        fechaCreacion
fechaCreacion fechaActualizacion
              creadoPorId ──→ User
              asignadoAId ──→ User (nullable)
              computadoraId ─→ Computadora (nullable)

Historial
─────────
id
accion          (CREADO | CAMBIO_ESTADO | ELIMINADO)
descripcion
fecha
ticketId ──────→ Ticket
usuarioId ─────→ User
```

**Enums disponibles:**
- `Rol`: `ADMIN` | `USER`
- `EstadoTicket`: `ABIERTO` | `EN_PROCESO` | `RESUELTO` | `CERRADO`
- `Prioridad`: `BAJA` | `MEDIA` | `ALTA` | `CRITICA`

---

## Autenticación

El sistema usa **JWT stateless**. El flujo es:

1. El cliente envía `email` + `password` a `POST /api/auth/login`
2. El backend valida credenciales y compara el hash con bcryptjs
3. Se genera un JWT firmado con `JWT_SECRET` (expiración: 7 días)
4. El cliente incluye el token en cada request protegida:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. El middleware `authenticate` verifica el token antes de ejecutar la ruta

**Reglas de seguridad:**
- El `rol` se asigna siempre desde el backend — nunca desde el body del request
- El campo `password` nunca se retorna en ninguna respuesta
- Los mensajes de error de login no distinguen entre email inexistente y contraseña incorrecta (anti-enumeración)

---

## Scripts disponibles

```bash
npm run dev              # Servidor con hot-reload (nodemon)
npm run start            # Servidor en producción
npm run prisma:generate  # Generar cliente de Prisma
npm run prisma:migrate   # Aplicar migraciones (desarrollo)
npm run prisma:studio    # Abrir UI de base de datos en el navegador
```

---

## Deploy en el servidor de la escuela

El sistema está configurado para operar en la red local institucional.

**IP del servidor:** `192.168.0.31`  
**Puerto API:** `3000`  
**URL de acceso:** `http://192.168.0.31:3000/api/health`

Para el procedimiento completo de instalación en el servidor, referirse al **Manual de Instalación** incluido en la documentación técnica oficial del proyecto (sección 10).

Pasos resumidos:
```bash
# En el servidor
git clone <repo> && cd sistemadetickets
npm install
# Configurar .env con DATABASE_URL apuntando a localhost y NODE_ENV=production
npx prisma generate
npx prisma migrate deploy
sudo npm install -g pm2
pm2 start src/server.js --name sistemadetickets
pm2 save && pm2 startup
```

---

## Estado del proyecto

| Sprint | Módulo | Estado |
|--------|--------|--------|
| Sprint 1 | Backend — Arquitectura y setup | ✅ Completado |
| Sprint 1 | Backend — Base de datos (Prisma + PostgreSQL) | ✅ Completado |
| Sprint 1 | Backend — Autenticación JWT | ✅ Completado |
| Sprint 1 | Backend — Módulo de tickets con historial | ✅ Completado |
| Sprint 1 | Testing y validación | ✅ Completado |
| Sprint 1 | Documentación técnica | ✅ Completado |
| Sprint 2 | Módulo de computadoras (endpoints completos) | 🔜 Pendiente |
| Sprint 2 | Frontend | 🔜 Pendiente |

---

## Equipo de desarrollo — Backend

| Integrante | Rol |
|-----------|-----|
| Tobias Vera | Tech Lead / Backend Lead / Backend developer |
| Juan Jiménez | Arquitecto de Datos |
| Thiago Angrisani | DevOps |
| Damián Orellana | Seguridad / Autenticación |
| Rachael Choque | Testing / QA |
| Luz Huanca | Documentación |

---

*ET N° 20 D.E. 20 "Carolina Muzilli" — Especialidad TICs*