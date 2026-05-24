---
title: Architecture
aliases:
- Arquitetura
- Arquitetura do Sistema
- System Architecture
- Flux Architecture
section: architecture
tags:
- domain/architecture
- domain/database
---

# Flux Delivery — Architecture

> [!abstract] Hub de Arquitetura
> Documentação central do sistema. Seções detalhadas estão em notas especializadas — siga os wikilinks.

## System Overview

![[System Overview e Stack#Diagrama do Sistema]]

**Multi-profile delivery SaaS**: Client, Merchant, Admin, Superadmin, Courier.

→ [[System Overview e Stack]] — Diagrama, stack, directory structure

---

## Frontend Architecture

### Routing Layer

- **Entry point**: `src/main.tsx` → `<App />` via React Router 7
- **Layouts**: `PublicLayout` (consumer), `DashboardLayout` (admin/superadmin/courier), `ExperienceLayout` (experience), Merchant (standalone)
- **Lazy loading**: `React.lazy()` para code splitting
- **Route constants**: `src/lib/routes.ts` — `ROUTES` + helpers dinâmicos

→ [[Frontend — Estrutura e Padrões]] — Stack, lazy loading, React Query, proximidade

### Data Layer (API → Repository → Hook → Component)

```
Page Component → useHook (useQuery) → Repository (data fn) → API module (httpClient)
```

- **`src/api/`** — Wrappers `httpClient` + query keys em `api/queryKeys.ts`
- **`src/repositories/`** — Transforma responses, retorna models tipados
- **`src/hooks/`** — `useQuery`/`useMutation`, naming `use<Domain>`
- **Query client**: stale 2min, GC 5min, retry 2, `refetchOnWindowFocus: false`
- **HTTP client** (`httpClient.ts`): auto Bearer, 401→refresh, 15s timeout, `ApiError`

### Modules (Profile-based)

| Module | Description |
|--------|-------------|
| `auth/` | Login, register, ProtectedRoute, useAuthSession |
| `merchant/` | Dashboard, catalog, orders, branches, campaigns, finance |
| `superadmin/` | Plans, capabilities, addons, billing, audit |
| `admin/` | Dashboard, companies, coverage |
| `courier/` | Dashboard, deliveries |
| `experience/` | Favorites, reviews, loyalty, promotions |
| `enterprise/` | Bulk ops, advanced reporting |
| `saas/` | Capability system — `FeatureGate`, `FeatureRoute` |

→ [[SaaS Capability System]] — Feature resolution, plans, addons, feature flags

### Presentation Layer

- **Tailwind CSS v4** (CSS-first), `tailwind-variants` + `tailwind-merge`
- **UI primitives**: `FxButton`, `FxInput`, `FxText`, `ThemeProvider`
- **Theming flow**: `App.tsx` → `useMyTheme(area)` → localStorage → `dark` class on `<html>`
- **Location context**: GPS → cached → IP fallback, city coverage detection

→ [[Packages Locais]] · [[MOC — UI Primitives]]

---

## Backend Architecture

### HTTP Layer

**Server entry**: `server/src/index.ts` — Hono app + global middleware + route modules.

**Health endpoints**: `GET /api/health/live` (liveness), `GET /api/health/ready` (readiness), `GET /api/health` (combined). **Metrics**: `GET /api/metrics` (Prometheus).

### Route Modules (35+ route files)

| Categoria | Rotas |
|-----------|-------|
| **Públicas** | `/api/auth`, `/api/restaurants`, `/api/categories`, `/api/menu-items`, `/api/coverage-cities`, `/api/reviews`, `/api/plans`, `/api/capabilities`, `/api/theme` |
| **Protegidas** | `/api/companies`, `/api/branches`, `/api/orders`, `/api/operations`, `/api/holidays`, `/api/global-coupons`, `/api/merchant-coupons`, `/api/campaigns`, `/api/subscriptions`, `/api/invoices`, `/api/admin/users`, `/api/addons`, `/api/feature-flags`, `/api/notifications`, `/api/audit-events`, `/api/support-tickets`, `/api/branch-settings`, `/api/commission-plans`, `/api/admin/reports`, `/api/loyalty`, `/api/coupons/validate`, `/api/printing`, `/api/permissions` |

**Route pattern**: `new Hono()` + `zValidator()` + `db.select()`/`.insert()`/`.update()` → `c.json()`

→ [[Rotas da API]] · [[API]] — Referência completa de endpoints

### Middleware

→ [[Middlewares e Segurança]] — Stack completo, auth, permissions, rate limiting, CORS

### Database Layer

**Connection**: Drizzle ORM + `postgres.js` (`prepare: false`).

| Module directory | Tables |
|---|---|
| `core/` | `restaurants`, `categories`, `menu_items`, `additives` |
| `customer/` | `users`, `addresses`, `orders`, `reviews` |
| `merchant/` | `companies`, `branches`, `merchant_orders`, `merchant_menu_items`, `branch_settings` |
| `commerce/` | `global_coupons`, `merchant_coupons`, `campaigns`, `loyalty` |
| `saas/` | `plans`, `capabilities`, `subscriptions`, `invoices`, `addons`, `subscription_addons`, `feature_flags`, `commission_plans` |
| `operations/` | `business_hours`, `business_hour_periods`, `holiday_rules`, `holiday_overrides`, `special_dates`, `auth_sessions`, `password_resets`, `audit_logs` |
| `ops/` | `coverage_cities`, `notifications`, `user_notifications`, `support_tickets`, `audit_events`, `permissions`, `role_permissions`, `printing` |

→ [[Arquitetura de Dados]] · [[DATABASE]] — Schema, provider selector, registry

### Services

| Service | Purpose |
|---|---|
| `auditLogService` | Audit log entries |
| `cleanupAuthSessions` | Expired session cleanup |
| `coverageCityService` | Coverage city seeding |
| `rateLimitStore` / `redisRateLimitStore` | Rate limiting storage |
| `operations/` | Business hours logic |
| `printing/` | ESC/POS thermal printer |

→ [[Estrutura do Backend]] · [[Módulos Core do Backend]]

---

## Shared Layer (`shared/`)

Zod schemas compartilhados frontend/backend:

| File | Schemas |
|---|---|
| `address.ts` | `addressSchema`, `zipCodeSchema` |
| `restaurant.ts` | `restaurantSchema` |
| `operations.ts` | `timeStringSchema`, `hourPeriodSchema`, `businessHoursSchema`, `holidaySchema` |

→ [[Repository Ports & Schemas]]

---

## Cross-cutting Concerns

→ [[Authentication Flow]] — JWT HS256, login/refresh/logout, session validation, auth providers

→ [[Middlewares e Segurança]] — Middleware stack, roles/permissions, CSRF, CORS, rate limiting

→ [[Error Handling e Performance]] — Error hierarchy, Prometheus, graceful shutdown, optimizations

---

## Key Architectural Decisions

→ [[Decisões Arquiteturais]] — 10 decisões com links para notas especializadas

---

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] — Mapa completo da documentação arquitetural
