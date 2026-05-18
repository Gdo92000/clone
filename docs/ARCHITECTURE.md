# Architecture

## System Overview

Arquitetura frontend + backend separados (monorepo no mesmo repositório), conectados via REST.

```
Cliente (React) ──HTTP──> Servidor (Hono) ──SQL──> PostgreSQL
```

## Frontend Layers

### 1. Routing Layer (`src/App.tsx`)
React Router 7 com lazy loading. Três layouts principais:
- **PublicLayout** — páginas públicas (Home, Restaurantes, Cart, Checkout)
- **DashboardLayout** — painéis autenticados (Superadmin, Admin, Courier)
- Merchant routes são protegidas por `ProtectedRoute` + `FeatureRoute` (gates de capability)

### 2. Data Layer
- **TanStack React Query 5** para cache e fetching
- Hooks customizados em `src/hooks/` (useRestaurants, useMerchantData, useOperations)
- Repositórios em `src/repositories/`
- Serviços em `src/services/` (API calls, fakeApi, geocode)

### 3. Modules
Cada perfil é um módulo isolado:
- `src/modules/merchant/` — Lojista
- `src/modules/superadmin/` — Superadmin SaaS
- `src/modules/admin/` — Operacional
- `src/modules/courier/` — Entregador
- `src/modules/experience/` — Experiência (favoritos, notificações, etc.)
- `src/modules/auth/` — Autenticação
- `src/modules/saas/` — Lógica de capabilities, billing, feature flags

### 4. SaaS Layer (`src/modules/saas/`)
Controla recursos pagos via capability catalog. Ordem de resolução:
1. Status de billing (past_due, blocked, cancelled)
2. Feature flag manual (global → empresa → filial → usuário)
3. Plano base
4. Addons contratados

## Backend Layers

### 1. HTTP Layer (Hono)
`server/src/index.ts` configura:
- CORS dinâmico por ALLOWED_ORIGINS
- Logger
- Error handler unificado (AppError, ZodError, PostgresError)
- Rotas públicas (/api/auth) e protegidas (/api/* com JWT)

### 2. Route Modules
- `routes/auth.ts` — Login com bcrypt + JWT (24h)
- `routes/holidays.ts` — Feriados (CRUD + seed por ano + consulta por data)
- `routes/operations.ts` — Horários, overrides de feriado, datas especiais por filial
- `routes/restaurants.ts` — Embutido em index.ts (GET/POST)

### 3. Database Layer
Drizzle ORM + postgres.js. Schema em `server/src/db/schema/`.

### 4. Middleware
- `middleware/auth.ts` — JWT validation via hono/jwt
- Validadores Zod nos parâmetros de rota via @hono/zod-validator

## Shared Layer
`shared/validations/` contém schemas Zod compartilhados entre frontend e backend (operations, restaurant, address).

## Error Handling
Error handler unificado em `server/src/lib/errors.ts`:
- `AppError` — erros customizados com status code
- `ZodError` → 400 com detalhes de validação
- Postgres connection errors → 503
- Unique constraint violation → 409
- Unhandled → 500 com path no log
