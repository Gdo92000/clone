# Flux Delivery

Multi-profile delivery SaaS platform connecting consumers, merchants, couriers, and administrators in a unified food ordering and delivery ecosystem.

## Profiles

| Profile | Description |
|---------|-------------|
| **Consumer** | Browse restaurants, search menu items, place orders, track deliveries in real time, manage addresses and payment methods |
| **Merchant** | Manage catalog, branches, team, orders, campaigns, analytics, finance, coupons, hours, holidays, printer config, and subscriptions |
| **Courier** | View delivery assignments, manage routes, update delivery status |
| **Admin** | Oversee companies, manage coverage cities and regional settings |
| **Superadmin** | Full SaaS control — plans, capabilities, addons, subscriptions, billing, feature flags, users, audit, commissions, coupons, categories, notifications, reports |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| Routing | React Router 7 (code-split lazy routes) |
| State / Data | TanStack React Query 5 |
| UI Components | packages/ui (internal, imported via relative path) |
| Design Tokens | Inline via @theme in src/index.css (colors, typography, spacing) |
| Backend | Hono 4 + @hono/node-server |
| Database | PostgreSQL via Drizzle ORM 0.45 |
| Validation | Zod 4 (frontend + backend), @hono/zod-validator |
| Auth | JWT (HS256 via hono/jwt), bcryptjs, session refresh tokens |
| Cache | Redis via ioredis |
| Logging | pino |
| Metrics | prom-client |
| Testing | Vitest 4, MSW 2, Testing Library |
| Linting | ESLint 10 (flat config) |

## Quick Start

```sh
# 1. Clone and install
git clone <repo-url>
cd flux-delivery
npm install

# 2. Environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, and CORS_ORIGINS

# 3. Database
npm run db:generate
npm run db:migrate

# 4. Start development (frontend + backend concurrently)
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Frontend (Vite :5173) + Backend (Hono :3001) concurrently |
| `npm run dev:client` | Frontend only |
| `npm run dev:server` | Backend only (tsx watch) |
| `npm run build` | TypeScript typecheck + Vite production build |
| `npm run lint` | ESLint (flat config, covers `src/` and `server/src/`) |
| `npm test` | Vitest interactive |
| `npm run test:run` | Vitest single pass |
| `npm run test:coverage` | Vitest with coverage (v8) |
| `npm run db:generate` | Drizzle Kit schema → migration generation |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Drizzle Kit Studio (GUI) |

## Project Structure

```
├── src/                          # Frontend application
│   ├── api/                      # HTTP client + typed API modules
│   ├── components/               # Shared UI components
│   ├── hooks/                    # Custom React hooks
│   ├── layouts/                  # PublicLayout, DashboardLayout
│   ├── lib/                      # Routes, utilities
│   ├── modules/                  # Feature modules by profile
│   │   ├── admin/                # Admin panel
│   │   ├── auth/                 # Consumer + login flows
│   │   ├── courier/              # Courier dashboard
│   │   ├── enterprise/           # Enterprise features
│   │   ├── experience/           # Consumer experience pages
│   │   ├── merchant/             # Merchant dashboard & pages
│   │   ├── saas/                 # Feature-flag gating
│   │   └── superadmin/           # SaaS management panel
│   ├── pages/                    # Public route pages
│   ├── providers/                # React context providers
│   ├── services/                 # Business logic
│   └── test/                     # Test setup (MSW)
│
├── server/                       # Backend application
│   ├── src/
│   │   ├── auth/                 # JWT + local auth strategies
│   │   ├── db/
│   │   │   ├── schema/           # Drizzle schema (core, customer, merchant, commerce, saas, ops, operations)
│   │   │   ├── seeds/            # Database seed data
│   │   │   └── index.ts          # DB connection
│   │   ├── lib/                  # Error handling, logger, health checks
│   │   ├── middleware/           # Auth, permission, tenant, rate-limit, metrics, security
│   │   ├── routes/               # 30+ route modules
│   │   ├── services/             # Business logic services
│   │   └── validations/          # Zod schemas
│   └── drizzle.config.ts
│
├── packages/
│   ├── tokens/                   # @fluxds/tokens — design tokens (colors, typography, spacing)
│   └── ui/                       # @fluxds/ui — React components + theme context
│
├── shared/
│   └── validations/              # Shared Zod schemas (restaurant, address, operations)
│
├── docs/                         # Project documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CONFIGURATION.md
│   ├── DEVELOPMENT.md
│   ├── FRONTEND_BACKEND_CONTRACT.md
│   ├── GETTING-STARTED.md
│   ├── kitchen-auto-print-addon.md
│   └── TESTING.md
│
├── drizzle/                      # Generated SQL migrations
└── public/                       # Static assets + MSW service worker
```

## Key Features

- **Restaurant discovery** — Browse by city, category, or search; geocoding via Photon/Nominatim
- **Real-time order tracking** — Live delivery status updates
- **Multi-tenant merchant portal** — Company + branch management, role-based team access, feature flags per subscription
- **Coupon & campaign engine** — Global and merchant-specific coupons, time-based campaigns
- **Subscription & billing** — SaaS plans, capabilities, addons, invoices, commission plans
- **Loyalty & reviews** — Consumer loyalty programs, restaurant ratings and reviews
- **Operations** — Coverage cities, holidays, branch operating hours, printing/kitchen auto-print
- **Admin & superadmin** — User management, permissions, audit trail, feature flags, metrics, reports
- **Theme system** — Per-tenant dynamic theming (CSS-driven via @fluxds/tokens)
- **Security** — JWT auth, rate limiting, CSRF, security headers, request ID tracing
- **Observability** — Structured logging (pino), Prometheus metrics, health endpoints

## Documentation

See the [`docs/`](./docs) directory for detailed guides:

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Testing Guide](./docs/TESTING.md)
- [Configuration](./docs/CONFIGURATION.md)
- [Frontend-Backend Contract](./docs/FRONTEND_BACKEND_CONTRACT.md)

## License

Private — All rights reserved.
