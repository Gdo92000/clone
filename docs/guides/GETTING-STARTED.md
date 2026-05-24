---
title: Getting Started
aliases:
- Inicio
- Setup
- Instalacao
- Quick Start
- Primeiros Passos
section: guides
tags:
- domain/setup
---

# Getting Started

## Prerequisites

- **Node.js** 20+ (tested with 22+)
- **PostgreSQL** 14+ (local or Supabase hosted)
- **npm** (comes with Node.js)

## Installation

```bash
git clone <repo-url>
cd flux-delivery
npm install
```

## Environment Setup

Copy the example env file and edit it:

```bash
cp .env.example .env
```

### Required variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/flux_delivery` |
| `JWT_SECRET` | HMAC secret for HS256 JWT tokens (change in production) | `dev-secret-change-in-production` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,http://localhost:3001` |

### Optional variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_MOCK` | `false` | Set to `true` to run frontend with MSW mock data (no backend needed) |
| `REDIS_URL` | `''` | Redis connection string (for distributed rate limiting) |
| `AUTH_PROVIDER` | `local` | Auth provider (`local` or `supabase`) |
| `PORT` | `3001` | Server port (overridable in `server/.env`) |

## Database Setup

### 1. Create the database

```sql
CREATE DATABASE flux_delivery;
```

### 2. Apply migrations

Migrations are pre-generated in `drizzle/`. Apply them:

```bash
npm run db:migrate
```

To regenerate migrations from the schema (after schema changes):

```bash
npm run db:generate
npm run db:migrate
```

### 3. (Optional) Browse with Drizzle Studio

```bash
npm run db:studio
```

Opens a web UI at the URL printed in the terminal.

## Running the Dev Server

Start frontend (Vite on `:5173`) and backend (Hono on `:3001`) concurrently:

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health check**: http://localhost:3001/api/health
- **Liveness**: http://localhost:3001/api/health/live
- **Readiness**: http://localhost:3001/api/health/ready

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Full stack — Vite (`:5173`) + Hono (`:3001`) concurrently |
| `npm run dev:client` | Frontend only |
| `npm run dev:server` | Backend only (tsx watch, auto-restart on changes) |
| `npm run build` | TypeScript typecheck + Vite production bundle |
| `npm run lint` | ESLint flat config (covers both `src/` and `server/src/`) |
| `npm test` | Vitest interactive watch mode |
| `npm run test:run` | Vitest single pass |
| `npm run test:coverage` | Vitest with v8 coverage report |
| `npm run db:generate` | Drizzle Kit — generate migration from schema diff |
| `npm run db:migrate` | Drizzle Kit — apply pending migrations |
| `npm run db:studio` | Drizzle Kit — web-based DB browser |
| `npm run preview` | Vite preview of production build |

## Mock Mode (No Backend Required)

For frontend-only development without a database:

```bash
VITE_MOCK=true npm run dev
```

This sets `__USE_MOCK__` to `true`, and MSW intercepts all API calls with fake data. The backend does not need to be running.

## Project Structure Overview

```
├── src/                          # Frontend (React 19, Vite 8, Tailwind CSS 4)
│   ├── api/                      # Typed HTTP client modules
│   ├── components/               # Shared UI components
│   ├── hooks/                    # React Query hooks (useQuery/useMutation)
│   ├── modules/                  # Feature modules by profile
│   │   ├── auth/                 # Login, register, ProtectedRoute
│   │   ├── merchant/             # Merchant dashboard
│   │   ├── admin/                # Admin panel
│   │   ├── superadmin/           # SaaS management
│   │   ├── courier/              # Courier dashboard
│   │   └── experience/           # Consumer experience
│   ├── pages/                    # Public pages (Home, Cart, Checkout)
│   └── providers/                # React context providers
│
├── server/                       # Backend (Hono 4 + Drizzle ORM)
│   └── src/
│       ├── auth/                 # JWT + local auth provider
│       ├── db/
│       │   ├── schema/           # 7 domain modules (core, customer, merchant, etc.)
│       │   ├── seeds/            # Database seed scripts
│       │   └── index.ts          # DB connection (postgres.js + drizzle)
│       ├── lib/                  # Error handler, logger, health checks
│       ├── middleware/           # Auth, permission, rate limit, CSRF, metrics
│       ├── routes/               # 36 route modules
│       └── services/             # Audit log, session cleanup, printing
│
├── packages/
│   ├── tokens/                   # @fluxds/tokens (design tokens)
│   └── ui/                       # @fluxds/ui (React primitives + theme)
│
├── shared/
│   └── validations/              # Zod schemas shared frontend/backend
│
├── drizzle/                      # SQL migration files
└── docs/                         # Architecture, API, config, testing docs
```

## Test Credentials

No database seed script for demo users is currently shipped. After running migrations, you can register a new account via:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'
```

Or login if one already exists:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Seeding addon data

```bash
npx tsx server/src/db/seeds/kitchen-auto-print-addon.seed.ts
```

## Common Issues

### `DATABASE_URL not set` error

Make sure you copied `.env.example` to `.env` and filled in the correct PostgreSQL connection string. The server reads `.env` via `tsx watch --env-file .env`.

### `relation "..." does not exist`

Run `npm run db:migrate` to apply all pending migrations.

### CORS errors on frontend

Verify `CORS_ORIGINS` in `.env` includes `http://localhost:5173`. The Vite dev server proxies `/api/*` to the backend, so in most cases CORS is not an issue during development.

### Port 3001 already in use

Stop any other process on port 3001, or override the port:

```bash
PORT=3002 npm run dev:server
```

### TypeScript errors after pulling

After pulling changes with schema modifications, run:

```bash
npm install
npm run db:migrate
npm run build   # typecheck + bundle
```

## Verification Checklist

After setup, confirm everything works:

```bash
# 1. Server responds
curl http://localhost:3001/api/health

# 2. Frontend loads
# Open http://localhost:5173 in a browser

# 3. Lint passes
npm run lint

# 4. TypeScript compiles
npm run build

# 5. Tests pass (if database is configured)
npm run test:run
```

## Production Build

```bash
npm run build
```

Output goes to `dist/`. Start the backend:

```bash
NODE_ENV=production tsx server/src/index.ts
```

> For production, set a strong `JWT_SECRET`, configure `CORS_ORIGINS` with your domain(s), and ensure the database is properly migrated.

---

> [!tip] Navegação
> [[MOC — Guias de Desenvolvimento]]
