---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/architecture
- domain/auth
---

# Middlewares e Segurança

## Global Middleware Stack

Applied to all routes via `app.use('*')`:

| Middleware | Purpose |
|------------|---------|
| `requestId` | Generates 8-char UUID → `c.set('requestId')` → `X-Request-Id` header |
| `securityHeaders` | Security response headers |
| `csrf()` | CSRF protection (Hono built-in) |
| `domainMiddleware` | Custom domain resolution (looks up `companies.custom_domain`) |
| `cors()` | Dynamic CORS from `ALLOWED_ORIGINS` env var, credentials: true |
| `logger()` | Request logging (Hono built-in) |
| `metricsHandler` | Prometheus metrics (request count, duration, errors, active) |

## Route-level Middleware

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

## Dual Authorization: Roles + Permissions

Authorization checks via `requirePermission()` middleware support both:
- **Legacy roles**: `superadmin`, `admin`, `company_owner`, `branch_manager`, `attendant`, `finance`, `courier`, `customer`
- **Granular permissions**: Stored in `rolePermissions` table, checked at runtime
- Superadmin bypasses all checks

On frontend, `ProtectedRoute` mirrors the check client-side for UX, but the backend is the source of truth.

## Vite Proxy for API Routing

Vite dev server proxies:
- `/api/photon/*` → `https://photon.komoot.io/api` (geocoding autocomplete)
- `/api/nominatim/*` → `https://nominatim.openstreetmap.org` (geocoding)
- `/api/viacep/*` → `https://viacep.com.br` (Brazilian ZIP code lookup)
- `/api/ipapi/*` → `https://ipapi.co` (IP geolocation)
- `/api/ip-api/*` → `http://ip-api.com` (IP geolocation fallback)
- `/api/*` → `http://localhost:3001` (app backend)

This eliminates CORS issues in development and provides a unified API surface.

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[ARCHITECTURE]] · [[Authentication Flow]]
