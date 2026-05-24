---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/architecture
---

# System Overview e Stack

## Diagrama do Sistema

```
┌────────────────────────────────────────────────────────────────────────────┐
│ HTTP (REST)                                                               │
│ ┌──────────────────────┐ ┌──────────────────────────────────┐ │
│ │ Frontend (React) │ ◄──────► │ Backend (Hono) │ │
│ │ │ JSON │ │ │
│ │ Port 5173 (Vite) │ │ Port 3001 (@hono/node-server) │ │
│ │ Port 5173 (dev) │ │ Port 3001 (production) │ │
│ └───────┬──────────────┘ └────────┬─────────────────────────┘ │
│ │ │ │
│ │ Proxy: /api/* │ SQL │
│ │ /api/photon/* │ │
│ │ /api/nominatim/* ▼ │
│ │ /api/viacep/* ┌──────────┐ │
│ │ /api/ipapi/* │PostgreSQL│ │
│ │ /api/ip-api/* └──────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

**Multi-profile delivery SaaS**: Client, Merchant, Admin, Superadmin, Courier.

## Stack

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

## Directory Structure

```
/
├── src/                          # Frontend (React)
│   ├── api/                      # HTTP client + API module wrappers
│   ├── components/               # Shared UI components
│   ├── context/                  # React contexts (LocationContext)
│   ├── dto/                      # Data Transfer Objects (DTOs)
│   ├── hooks/                    # Custom React hooks (useQuery/useMutation)
│   ├── layouts/                  # Layout components (PublicLayout, DashboardLayout)
│   ├── lib/                      # Utilities (routes, logger, queryClient, toast)
│   ├── mappers/                  # DTO → Model transformers
│   ├── mocks/                    # MSW mock handlers / service worker
│   ├── modules/                  # Feature modules by profile
│   │   ├── auth/                 # Login, register, session, ProtectedRoute
│   │   ├── merchant/             # Merchant dashboard, orders, catalog, etc.
│   │   ├── superadmin/           # SaaS management, plans, billing, audit
│   │   ├── admin/                # Operational admin (companies, coverage)
│   │   ├── courier/              # Courier deliveries dashboard
│   │   ├── experience/           # Consumer experience (favorites, reviews, etc.)
│   │   └── saas/                 # SaaS capability system, feature flags, billing
│   ├── pages/                    # Public pages (Home, Cart, Checkout, etc.)
│   ├── providers/                # React providers (QueryProvider, ToastProvider)
│   ├── repositories/             # Data access layer (server calls)
│   ├── services/                 # Business services (auth, location, geocode)
│   ├── storage/                  # Local storage abstraction
│   ├── types/                    # Shared frontend types (cart, order, restaurant)
│   ├── useCases/                 # Business logic (cartUseCase, pricingUseCase)
│   └── test/                     # Test setup + MSW handlers
│
├── server/                       # Backend (Hono)
│   └── src/
│       ├── auth/                 # Auth provider interface + local implementation
│       ├── db/                   # Database connection + schema
│       │   ├── schema/           # Drizzle ORM schema modules
│       │   │   ├── core/         # Restaurants, categories, menu items, additives
│       │   ├── customer/         # Users, addresses, orders, reviews
│       │   ├── merchant/         # Companies, branches, merchant orders, menus
│       │   ├── commerce/         # Coupons, campaigns, loyalty
│       │   ├── saas/             # Plans, subscriptions, addons, feature flags
│       │   ├── operations/       # Business hours, holidays, special dates
│       │   └── ops/              # Coverage, notifications, audit, support, printing
│       │   └── seeds/            # Database seed data
│       ├── lib/                  # Error handler, logger, health check
│       ├── middleware/           # auth, permission, rateLimit, requestId, etc.
│       ├── routes/               # Route modules (36 route files)
│       ├── services/             # Audit log, session cleanup, printing, rate limit
│       └── validations/          # Server-side Zod schemas
│
├── shared/
│   └── validations/              # Shared Zod schemas (address, restaurant, operations)
│
├── packages/
│   ├── tokens/                   # @fluxds/tokens (colors, typography, spacing)
│   └── ui/                       # @fluxds/ui (FxButton, FxInput, FxText, ThemeContext)
│
├── docs/                         # Architecture, API, testing, configuration docs
├── drizzle/                      # SQL migration files
└── public/                       # Static assets + MSW mock service worker
```

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[ARCHITECTURE]] · [[Visão Geral do Projeto]]
