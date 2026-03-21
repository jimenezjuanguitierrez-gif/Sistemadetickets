# Sistemadetickets# Help Desk API

Backend REST API for technical ticket management in an educational institution.

## Stack

- **Runtime**: Node.js (ESM)
- **Framework**: Express
- **ORM**: Prisma
- **Auth**: JWT + bcryptjs

## Project Structure

```
src/
├── config/
│   ├── env.js          # Centralized env var access + validation
│   └── prisma.js       # PrismaClient singleton
├── controllers/        # HTTP layer: parse request, call service, send response
├── services/           # Business logic layer: pure functions, no req/res
├── routes/
│   └── index.js        # Route aggregator — mounts all domain routers
├── middlewares/
│   ├── AppError.js     # Custom error class with HTTP context
│   ├── auth.js         # JWT authentication + role-based authorization
│   ├── errorHandler.js # Global error handler (last middleware)
│   └── notFound.js     # 404 catch-all (after routes, before errorHandler)
├── app.js              # Express app factory (importable for tests)
└── server.js           # HTTP server entrypoint + graceful shutdown
prisma/
└── schema.prisma       # Database schema
```

## Layer Responsibilities

| Layer | Responsibility | What it must NOT do |
|---|---|---|
| `routes` | Declare endpoints + apply middleware | Contain logic |
| `controllers` | Parse HTTP in/out, call services | Contain business rules |
| `services` | Business logic, DB access via Prisma | Know about req/res |
| `middlewares` | Cross-cutting concerns (auth, errors) | Contain domain logic |
| `config` | App configuration + external clients | Contain business logic |

## Getting Started

```bash
cp .env.example .env
# Fill in DATABASE_URL and JWT_SECRET

npm install
npm run prisma:generate
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | ❌ | Token expiry (default: `7d`) |
| `PORT` | ❌ | HTTP port (default: `3000`) |
| `NODE_ENV` | ❌ | Environment (default: `development`) |
| `CORS_ORIGIN` | ❌ | Allowed CORS origin (default: `*`) |
