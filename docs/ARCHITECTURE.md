# Flux Delivery — Architecture

## System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            HTTP (REST)                                     │
│  ┌──────────────────────┐          ┌──────────────────────────────────┐    │
│  │   Frontend (React)   │ ◄──────► │   Backend (Hono)                │    │
│  │                      │   JSON   │                                  │    │
│  │  Port 5173 (Vite)    │          │  Port 3001 (@hono/node-server)   │    │
│  │  Port 5173 (dev)     │          │  Port 3001 (production)          │    │
│  └───────┬──────────────┘          └────────┬─────────────────────────┘    │
│          │                                   │                             │
│          │ Proxy: /api/*                     │ SQL                          │
│          │        /api/photon/*              │                             │
│          │        /api/nominatim/*            ▼                             │
│          │        /api/viacep/*         ┌──────────┐                       │
│          │        /api/ipapi/*          │PostgreSQL│                       │
│          │        /api/ip-api/*         └──────────┘                       │
└────────────────────────────────────────────────────────────────────────────┘
```

**Multi-profile delivery SaaS**: Client, Merchant, Admin, Superadmin, Courier.

**Stack summary**:
| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, TanStack React Query 5, React Router 7 |
| Backend | Hono 4, `@hono/node-server`, Drizzle ORM 0.45, Zod 4 |
| Database | PostgreSQL |
| Auth | JWT (HS256 via `hono/jwt`), bcryptjs, session refresh tokens |
| Design tokens | Defined inline in `src/index.css` (colors, typography, spacing) |
| UI components | `packages/ui/` (imported via relative path `../packages/ui/src/context` — React components with ThemeContext) |
| Shared validation | `shared/validations/` (Zod schemas shared frontend/backend) |
| Logging | pino + pino-pretty (dev) |
| Metrics | prom-client (Prometheus) |
| Rate limiting | In-memory / Redis-backed sliding window |

---

## Directory Structure

```
/
├── src/                      # Frontend (React)
│   ├── api/                  # HTTP client + API module wrappers
│   ├── components/           # Shared UI components
│   ├── context/              # React contexts (LocationContext)
│   ├── dto/                  # Data Transfer Objects (DTOs)
│   ├── hooks/                # Custom React hooks (useQuery/useMutation)
│   ├── layouts/              # Layout components (PublicLayout, DashboardLayout)
│   ├── lib/                  # Utilities (routes, logger, queryClient, toast)
│   ├── mappers/              # DTO → Model transformers
│   ├── mocks/                # MSW mock handlers / service worker
│   ├── modules/              # Feature modules by profile
│   │   ├── auth/             # Login, register, session, ProtectedRoute
│   │   ├── merchant/         # Merchant dashboard, orders, catalog, etc.
│   │   ├── superadmin/       # SaaS management, plans, billing, audit
│   │   ├── admin/            # Operational admin (companies, coverage)
│   │   ├── courier/          # Courier deliveries dashboard
│   │   ├── experience/       # Consumer experience (favorites, reviews, etc.)
│   │   └── saas/             # SaaS capability system, feature flags, billing
│   ├── pages/                # Public pages (Home, Cart, Checkout, etc.)
│   ├── providers/            # React providers (QueryProvider, ToastProvider)
│   ├── repositories/         # Data access layer (server calls)
│   ├── services/             # Business services (auth, location, geocode)
│   ├── storage/              # Local storage abstraction
│   ├── types/                # Shared frontend types (cart, order, restaurant)
│   ├── useCases/             # Business logic (cartUseCase, pricingUseCase)
│   └── test/                 # Test setup + MSW handlers
│
├── server/                   # Backend (Hono)
│   └── src/
│       ├── auth/             # Auth provider interface + local implementation
│       ├── db/               # Database connection + schema
│       │   ├── schema/       # Drizzle ORM schema modules
│       │   │   ├── core/     # Restaurants, categories, menu items, additives
│       │   │   ├── customer/ # Users, addresses, orders, reviews
│       │   │   ├── merchant/ # Companies, branches, merchant orders, menus
│       │   │   ├── commerce/ # Coupons, campaigns, loyalty
│       │   │   ├── saas/     # Plans, subscriptions, addons, feature flags
│       │   │   ├── operations/# Business hours, holidays, special dates
│       │   │   └── ops/      # Coverage, notifications, audit, support, printing
│       │   └── seeds/        # Database seed data
│       ├── lib/              # Error handler, logger, health check
│       ├── middleware/       # auth, permission, rateLimit, requestId, etc.
│       ├── routes/           # Route modules (36 route files)
│       ├── services/         # Audit log, session cleanup, printing, rate limit
│       └── validations/      # Server-side Zod schemas
│
├── shared/
│   └── validations/          # Shared Zod schemas (address, restaurant, operations)
│
├── packages/
│   ├── tokens/               # @fluxds/tokens (colors, typography, spacing)
│   └── ui/                   # @fluxds/ui (FxButton, FxInput, FxText, ThemeContext)
│
├── docs/                     # Architecture, API, testing, configuration docs
├── drizzle/                  # SQL migration files
└── public/                   # Static assets + MSW mock service worker
```

---

## Frontend Architecture

### 1. Routing Layer

**Entry point**: `src/main.tsx` → mounts `<App />` inside `<StrictMode>`, optionally starts MSW mock service worker.

**Route orchestration**: `src/App.tsx` defines all routes via React Router 7 `<Routes>`. Three layout wrappers:

| Layout | Routes | Description |
|--------|--------|-------------|
| `PublicLayout` | Home, Restaurants, Cart, Checkout, Login, public profile, orders | Consumer-facing pages with header/footer |
| `DashboardLayout` | Superadmin, Admin, Courier | Authenticated dashboard with sidebar navigation |
| `ExperienceLayout` | Consumer experience pages | Experience-specific layout with header/footer |
| Merchant (standalone) | Merchant pages | Merchant-specific routes with `ProtectedRoute` + optional `FeatureRoute` |

**Lazy loading**: Every page uses `React.lazy(() => import('./pages/...'))` for code splitting.

**Route constants**: `src/lib/routes.ts` centralizes all routes as `ROUTES` const object, plus helpers for dynamic route generation (`restaurantDetailHref`, `trackingHref`, etc.). Also provides `ROUTE_AREA` mapping and `getLoginUrlForPath` for profile-aware redirects.

### 2. Data Layer (API → Repository → Hook → Component)

A strict layered data flow:

```
┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌─────────────┐
│   Page   │───►│   useHook    │───►│ Repository│───►│  API module  │
│ Component│    │ (useQuery)   │    │ (data fn) │    │ (httpClient) │
└──────────┘    └──────────────┘    └──────────┘    └─────────────┘
                                                           │
                                                           ▼
                                                     ┌──────────┐
                                                     │httpClient│
                                                     │(fetch)   │
                                                     └──────────┘
```

**Layers**:
- **`src/api/`** — Thin wrappers around `httpClient` (get/post/put/del). Each domain has its own file: `authApi.ts`, `merchantApi.ts`, `restaurantApi.ts`, `superadminApi.ts`, etc. Query key factories at `api/queryKeys.ts`.
- **`src/repositories/`** — Transforms API response data, calls API modules. Returns typed model objects.
- **`src/hooks/`** — Custom hooks using `useQuery` / `useMutation` from TanStack React Query. Each hook consumes a repository function and returns the query result. Hook naming: `use<Domain>`, e.g. `useMerchantData`, `useRestaurants`.
- **Components** call hooks — never call API or repositories directly.

**Query client defaults** (`src/lib/queryClient.ts`):
- Stale time: 2 minutes
- GC time: 5 minutes
- Retry: 2 (queries), 0 (mutations)
- `refetchOnWindowFocus: false`

**Centralized query keys** (`src/api/queryKeys.ts`):
Namespaced key factories: `merchantKeys`, `operationsKeys`, `superadminKeys`, `saasKeys`, `restaurantKeys`, `coverageKeys`, `courierKeys`, `adminKeys`, `authKeys`, `consumerKeys`, `themeKeys`. Enables targeted cache invalidation.

**HTTP client** (`src/api/httpClient.ts`):
- Base URL: `/api` proxied to backend (port 3001) via Vite
- Automatic Bearer token injection from `authService`
- Automatic 401 → token refresh flow (deduped with `isRefreshing` lock)
- On refresh failure: clears auth, redirects to profile-appropriate login
- 15-second request timeout
- `ApiError` class with status + data payload

### 3. Modules (Profile-based)

Code-split by business profile:

| Module | Description |
|--------|-------------|
| `auth/` | `LoginPage`, `LoginForm`, `ProtectedRoute`, `useAuthSession`, types (UserRole, PermissionKey) |
| `merchant/` | Merchant dashboard, catalog, orders, branches, team, campaigns, analytics, finance, coupons, subscription, settings, printer config, hours, holidays |
| `superadmin/` | SaaS management — plans, capabilities, addons, subscriptions, feature flags, billing, users, audit, commissions, coupons, categories, notifications, reports, demo data |
| `admin/` | Operational admin — dashboard, companies, coverage (cities) |
| `courier/` | Courier dashboard, deliveries |
| `experience/` | Consumer experience — access hub, favorites, finance, notifications, loyalty, onboarding, payment methods, promotions, reviews, support |
| `enterprise/` | Enterprise features — bulk operations, advanced reporting, multi-branch management |
| `saas/` | **SaaS capability system** (see section below) — `FeatureGate`, `FeatureRoute`, capability catalog, access resolution, feature key types |

### 4. SaaS & Capability System (`src/modules/saas/`)

Gates paid features by resolving plan, addon, feature flag, and billing status.

**Feature resolution order** (in `resolveFeatureAccess`):

```
1. Billing status check → blocked/cancelled → disabled
2. Manual feature flag (highest priority):
   a. User-level override
   b. Branch-level override
   c. Company-level override
3. Plan-level: feature included in base plan?
4. Addon-level: feature provided by a purchased addon?
```

**Components**:
- **`FeatureRoute`** — Route guard. Wraps merchant routes. Shows "Recurso indisponível" if access denied.
- **`FeatureGate`** — Inline component guard for granular UI toggles.
- **`useFeatureAccess`** — Hook returning `{ enabled, reason }` given companyId, featureKey, optional branchId.
- **`capabilityCatalog`** — Static catalog of 17 capabilities with pricing, dependencies, category, required plan.
- **`saasAccess.ts`** — Pure functions: `resolveFeatureAccess`, `calculateSubscriptionTotal`.
- **Types**: `PlanId`, `FeatureKey`, `BillingStatus`, `SaasPlan`, `SaasAddon`, `CompanySubscription`, `FeatureFlagOverride`, `SaasCapability`, `CapabilityCategory`.

**Plans**: `basic`, `pro`, `premium`.

### 5. Presentation Layer

**Styling**:
- Tailwind CSS v4 (CSS-first via `@tailwindcss/postcss`, no `tailwind.config.js`)
- Design tokens from `@fluxds/tokens` (colors, typography, spacing)
- Component variants via `tailwind-variants` + `tailwind-merge`
- `sonner` for toast notifications

**UI primitive components** (`packages/ui/src/primitives/`):
- `FxButton`, `FxInput`, `FxText` — reusable design-system components
- `ThemeProvider` / `useTheme` — light/dark/system theme with per-area storage key
- Theme resolution per route area via `useMyTheme` hook + `ThemeAwareProvider`

**Theming flow**:
1. `App.tsx` reads current route area from URL path
2. `useMyTheme(area)` fetches theme from server
3. `ThemeProvider` stores theme in localStorage keyed by area (`fluxds-theme:{area}`)
4. Theme toggles `dark` class on `<html>` element

**Location context** (`src/context/LocationContext.tsx`):
- Progressive geolocation (GPS → cached → IP fallback)
- City coverage detection against registered cities
- Manual city selection fallback
- Cache hydration

---

## Backend Architecture

### 1. HTTP Layer

**Server entry**: `server/src/index.ts` — creates Hono app, registers global middleware, mounts route modules.

**Global middleware stack** (applied to all routes via `app.use('*')`):

| Middleware | Purpose |
|------------|---------|
| `requestId` | Generates 8-char UUID → `c.set('requestId')` → `X-Request-Id` header |
| `securityHeaders` | Security response headers |
| `csrf()` | CSRF protection (Hono built-in) |
| `domainMiddleware` | Custom domain resolution (looks up `companies.custom_domain`) |
| `cors()` | Dynamic CORS from `ALLOWED_ORIGINS` env var, credentials: true |
| `logger()` | Request logging (Hono built-in) |
| `metricsHandler` | Prometheus metrics (request count, duration, errors, active) |

**Error handler**: `app.onError(errorHandler)` — unified error handler at `server/src/lib/errors.ts`.

**Health endpoints** (public):
- `GET /api/health/live` — liveness check (returns 200)
- `GET /api/health/ready` — readiness check (returns 503 if DB down)
- `GET /api/health` — combined health status

**Metrics**: `GET /api/metrics` — Prometheus text format.

### 2. Route Modules (35 production route files + 1 test file)

**Public routes** (no JWT required):

| Route prefix | Module | Description |
|---|---|---|
| `/api/auth` | `routes/auth.ts` | Login, register, refresh, logout, forgot/reset password, me |
| `/api/restaurants/...` | inline in `index.ts` | Restaurant list/detail + menu items |
| `/api/categories` | `routes/categories.ts` | Food categories |
| `/api/menu-items` | `routes/menu-items.ts` | Menu items CRUD |
| `/api/coverage-cities` | `routes/coverage-cities.ts` | City coverage lookup |
| `/api/reviews` | `routes/consumer-reviews.ts` | Public reviews |
| `/api/plans` | `routes/plans.ts` | SAAS plans (public read) |
| `/api/capabilities` | `routes/capabilities.ts` | Capability catalog (public read) |
| `/api/theme` | `routes/theme.ts` | Theme configuration |

**Protected routes** (JWT required via `authMiddleware`), mounted under `/api/`:

| Route prefix | Module | Description |
|---|---|---|
| `/api/companies` | `routes/companies.ts` | Company management |
| `/api/branches` | `routes/branches.ts` | Branch management |
| `/api/orders` | `routes/orders.ts` | Consumer orders |
| `/api/operations` | `routes/operations.ts` | Business hours, special dates |
| `/api/holidays` | `routes/holidays.ts` | Holiday rules + seed |
| `/api/global-coupons` | `routes/global-coupons.ts` | Global coupons |
| `/api/merchant-coupons` | `routes/merchant-coupons.ts` | Merchant coupons |
| `/api/campaigns` | `routes/campaigns.ts` | Marketing campaigns |
| `/api/subscriptions` | `routes/subscriptions.ts` | SAAS subscriptions |
| `/api/subscription-addons` | `routes/subscription-addons.ts` | Addon subscription links |
| `/api/invoices` | `routes/invoices.ts` | Billing invoices |
| `/api/admin/users` | `routes/admin-users.ts` | User management (admin) |
| `/api/addons` | `routes/addons.ts` | SAAS addon management |
| `/api/feature-flags` | `routes/feature-flags.ts` | Feature flag overrides |
| `/api/notifications` | `routes/notifications.ts` | Notifications |
| `/api/audit-events` | `routes/audit-events.ts` | Audit trail |
| `/api/support-tickets` | `routes/support-tickets.ts` | Support tickets |
| `/api/me/orders` | `routes/consumer-orders.ts` | My orders (consumer) |
| `/api/me/notifications` | `routes/user-notifications.ts` | My notifications |
| `/api/branch-settings` | `routes/branch-settings.ts` | Branch configuration |
| `/api/commission-plans` | `routes/commission-plans.ts` | Commission plans |
| `/api/admin/reports` | `routes/admin-reports.ts` | Admin reports |
| `/api/loyalty` | `routes/loyalty.ts` | Loyalty program |
| `/api/coupons/validate` | `routes/coupons-engine.ts` | Coupon validation engine |
| `/api/printing` | `routes/printing.ts` | Kitchen auto-print (ESC/POS) |
| `/api/permissions` | `routes/permissions.ts` | Role-permission management |

**Route pattern**:
- Each module creates a `new Hono()` instance
- Input validation via `@hono/zod-validator` (`zValidator('json' | 'param' | 'query', schema)`)
- DB operations via `db.select() / .insert() / .update()` from Drizzle ORM
- Return `c.json(response, status)` or `c.json({ error })` with appropriate status

### 3. Middleware

| Middleware | File | Purpose |
|---|---|---|
| `authMiddleware` | `middleware/auth.ts` | Validates JWT via `hono/jwt` HS256, validates session existence/expiry in `authSessions` table |
| `getAuthMiddleware()` | `middleware/auth.ts` | Returns raw JWT middleware (used inline) |
| `getTokenPayload(c)` | `middleware/auth.ts` | Extracts typed `TokenPayload` from context |
| `requirePermission()` | `middleware/permission.ts` | Role-based OR permission-based access control. Superadmin always allowed. Checks `rolePermissions` table for granular permissions. |
| `requireFeature(featureKey)` | `middleware/feature.ts` | Checks if user's subscription includes a specific feature (via addon) |
| `requireTenantOwnership()` | `middleware/tenant.ts` | Verifies user's company/branch ownership of requested resources |
| `rateLimit(max, windowMs)` | `middleware/rateLimit.ts` | Sliding window rate limiter (in-memory or Redis-backed). Returns 429 with `X-RateLimit-*` headers. |
| `requestId` | `middleware/requestId.ts` | Generates per-request tracing ID |
| `securityHeaders` | `middleware/securityHeaders.ts` | Security response headers |
| `domainMiddleware` | `middleware/domain.ts` | Resolves company by custom domain from `Host` header |
| `metricsHandler` | `middleware/metrics.ts` | Collects Prometheus metrics per request |

### 4. Database Layer

**Connection**: `server/src/db/index.ts` — Drizzle ORM + `postgres.js` client with `prepare: false`.

**Schema modules** (Drizzle ORM table definitions):

| Module directory | Tables |
|---|---|
| `core/` | `restaurants`, `categories`, `menu_items`, `additives` |
| `customer/` | `users`, `addresses`, `orders` (consumer), `reviews` |
| `merchant/` | `companies`, `branches`, `merchant_orders`, `merchant_menu_items`, `branch_settings` |
| `commerce/` | `global_coupons`, `merchant_coupons`, `campaigns`, `loyalty` |
| `saas/` | `plans`, `capabilities`, `subscriptions`, `invoices`, `addons`, `subscription_addons`, `feature_flags`, `commission_plans` |
| `operations/` | `business_hours`, `business_hour_periods`, `holiday_rules`, `holiday_overrides`, `special_dates`, `auth_sessions`, `password_resets`, `audit_logs` |
| `ops/` | `coverage_cities`, `notifications`, `user_notifications`, `support_tickets`, `audit_events`, `permissions`, `role_permissions`, `printing` |

**Index definitions**: `db/schema/indexes.ts` — centralized index definitions organized by domain.

**Schema entrypoint**: `server/src/db/schema/index.ts` — re-exports all schema modules.

### 5. Services

| Service | Path | Purpose |
|---|---|---|
| `auditLogService` | `services/auditLogService.ts` | Creates audit log entries (login, register, password change, etc.) |
| `cleanupAuthSessions` | `services/cleanupAuthSessions.ts` | Periodic cleanup of expired auth sessions |
| `coverageCityService` | `services/coverageCityService.ts` | Seeds coverage cities from restaurant data |
| `rateLimitStore` | `services/rateLimitStore.ts` | In-memory rate limit store |
| `redisRateLimitStore` | `services/redisRateLimitStore.ts` | Redis-backed rate limit store |
| `operations/` | `services/operations/` | Business hours logic |
| `printing/` | `services/printing/` | ESC/POS thermal printer service |

---

## Shared Layer (`shared/`)

Zod validation schemas shared between frontend and backend:

| File | Schemas |
|---|---|
| `address.ts` | `addressSchema`, `zipCodeSchema` |
| `restaurant.ts` | `restaurantSchema` (name, cuisine, address, city, state, deliveryFee, lat/lng) |
| `operations.ts` | `timeStringSchema`, `hourPeriodSchema`, `businessHoursSchema`, `holidaySchema` |

Referenced from backend (`server/src/index.ts`) via relative import:
```ts
import { restaurantSchema } from '../../shared/validations/restaurant';
```

---

## Authentication Flow

### JWT Authentication (HS256)

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client  │          │  Server  │          │    DB    │
├──────────┤          ├──────────┤          ├──────────┤
│  POST    │─────────►│          │          │          │
│ /api/auth│  {email  │  provider│          │          │
│ /login   │  ,pass}  │ .login() │─────────►│  users   │
│          │          │          │  verify   │          │
│          │          │  bcrypt  │◄─────────┤          │
│          │          │          │          │          │
│          │◄─────────┤ generate │          │          │
│ {user,   │  JWT +   │ session  │─────────►│auth_     │
│  token,  │  refresh │  insert  │          │sessions  │
│  refresh}│          │          │          │          │
└──────────┘          └──────────┘          └──────────┘
```

**Login flow**:
1. `POST /api/auth/login` with email + password
2. Rate limited (10 req/60s)
3. Schema validated via Zod
4. Auth provider (`local` or `supabase` — supabase is only typed, not implemented) handles password verification (bcryptjs)
5. On success: generates JWT access token + refresh token, creates session record in `authSessions`
6. Returns `{ user, token, refreshToken, expiresIn }`

**Token refresh**:
1. Client detects 401 response
2. `httpClient` calls `POST /api/auth/refresh` with refresh token
3. Server verifies refresh token, issues new access token
4. On failure: clears auth, redirects to login

**Session validation** (in `authMiddleware`):
1. Decodes JWT via `hono/jwt` with HS256 secret
2. Extracts `session_id` from payload
3. Queries `authSessions` table — checks `revoked_at IS NULL` and `expires_at > NOW()`
4. Returns 401 if session revoked or expired

**Logout**: Revokes session in `authSessions` table.

**Auth provider interface** (`server/src/auth/types.ts`): `AuthProvider` interface with `login`, `register`, `logout`, `refresh`, `hashPassword`, `verifyPassword`, `generateTokens`, `verifyToken`, `verifyRefreshToken`, `getCurrentUser`, `middleware`.

**Current provider**: `local` (implemented in `server/src/auth/local/provider.ts`).

### Frontend Authentication

- `authService` manages token storage (localStorage with `fluxds-` prefix)
- `initAuthSync` listens for cross-tab logout events
- `authApi` wraps HTTP calls to `/api/auth/*`
- `useAuthSession` hook provides `currentUser`, `hasRole`, `hasPermission`
- `ProtectedRoute` component renders children only if authenticated, shows login link otherwise
- Role/permission check: `ProtectedRoute` with `roles` or `permission` props

---

## Error Handling Strategy

### Backend (`server/src/lib/errors.ts`)

**Error hierarchy**:

```
Error
├── AppError (custom)       — statusCode + message + optional details
│   ├── notFound()          → 404
│   ├── badRequest()        → 400
│   ├── conflict()          → 409
│   └── unauthorized()      → 401
├── HTTPException (Hono)    — JWT auth errors, etc.
├── ZodError                → 400 (validation errors with details)
└── PostgresError           — connection → 503, duplicate key → 409, else → 500
```

**Error handler flow**:
1. If `AppError` → JSON with error message, optional details (dev only), requestId
2. If `HTTPException` → status-based message
3. If `ZodError` → 400 with validation issues
4. If Postgres error with specific codes → 503 (connection) or 409 (duplicate)
5. Otherwise → 500 with generic message + requestId
6. All errors with status ≥ 500 are logged via pino with requestId

### Frontend (`src/api/httpClient.ts`)

- `ApiError` class with `status` + `data` fields
- Network errors → `{ message: 'Servidor indisponível...' }`
- 401 → auto refresh or redirect to login
- Non-OK responses → throw `ApiError(status, parsedBody)`
- Components/hooks handle via React Query's `onError` or try/catch

---

## Key Architectural Decisions

### 1. Monorepo without Workspaces

Both frontend and backend live in the same repo but are **not** linked via npm workspaces. Local packages (`packages/tokens`, `packages/ui`) are referenced via relative imports in source code. Single `package-lock.json` manages all dependencies.

### 2. Vite Proxy for API Routing

Vite dev server proxies:
- `/api/photon/*` → `https://photon.komoot.io/api` (geocoding autocomplete)
- `/api/nominatim/*` → `https://nominatim.openstreetmap.org` (geocoding)
- `/api/viacep/*` → `https://viacep.com.br` (Brazilian ZIP code lookup)
- `/api/ipapi/*` → `https://ipapi.co` (IP geolocation)
- `/api/ip-api/*` → `http://ip-api.com` (IP geolocation fallback)
- `/api/*` → `http://localhost:3001` (app backend)

This eliminates CORS issues in development and provides a unified API surface.

### 3. Dual Authorization: Roles + Permissions

Authorization checks via `requirePermission()` middleware support both:
- **Legacy roles**: `superadmin`, `admin`, `company_owner`, `branch_manager`, `attendant`, `finance`, `courier`, `customer`
- **Granular permissions**: Stored in `rolePermissions` table, checked at runtime
- Superadmin bypasses all checks

On frontend, `ProtectedRoute` mirrors the check client-side for UX, but the backend is the source of truth.

### 4. Feature Capability SaaS Model

Instead of simple role-based access for merchant features, a full SaaS capability system:
- Plans (`basic` / `pro` / `premium`) define base features
- Addons provide additional features (e.g., `campaigns`, `analytics`, `financial_suite`)
- Feature flags allow manual override at company/branch/user level
- Billing status (trial, active, past_due, blocked, cancelled) gates access

### 5. Shared Zod Schemas

Validation schemas in `shared/validations/` are imported by both frontend and backend, ensuring consistent validation rules for address, restaurant, and operations data.

### 6. Auth Provider Strategy Pattern

The `AuthProvider` interface abstracts authentication logic. Currently only `local` (bcryptjs + JWT) is implemented, but the architecture supports adding `supabase` or other providers by implementing the same interface.

### 7. Domain-Layered Database Schema

The Drizzle schema is organized by domain (`core`, `customer`, `merchant`, `commerce`, `saas`, `operations`, `ops`) rather than by technical concern. Each domain directory has its own `index.ts` for exports and `relations.ts` for Drizzle relations.

### 8. Prometheus Metrics

Middleware tracks request count, duration, errors, and active requests via `prom-client`. Paths are normalized (UUIDs → `:uuid`) for clean metric labels. Exposed at `GET /api/metrics`.

### 9. Graceful Shutdown

The server handles `SIGTERM`/`SIGINT` with:
1. Checks database connectivity; returns 503 if database is down
2. Closes HTTP server
3. Forces exit after 10-second timeout

### 10. Performance Optimizations

- **Code splitting**: Every page is lazy-loaded
- **Bundle chunking**: Vite configured with `manualChunks` for React, lucide-react icons, and other vendor code
- **React Query caching**: 2-min stale time, 5-min GC, prevents redundant API calls
- **DB indexes**: Comprehensive index strategy defined per domain
- **Rate limiting**: Configurable per-route, Redis support for multi-instance deployments
