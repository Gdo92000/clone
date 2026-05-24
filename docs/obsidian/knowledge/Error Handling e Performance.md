---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/architecture
---

# Error Handling e Performance

## Error Hierarchy — Backend (`server/src/lib/errors.ts`)

```
Error
├── AppError (custom) — statusCode + message + optional details
│   ├── notFound() → 404
│   ├── badRequest() → 400
│   ├── conflict() → 409
│   └── unauthorized() → 401
├── HTTPException (Hono) — JWT auth errors, etc.
├── ZodError → 400 (validation errors with details)
└── PostgresError — connection → 503, duplicate key → 409, else → 500
```

## Error Handler Flow

1. If `AppError` → JSON with error message, optional details (dev only), requestId
2. If `HTTPException` → status-based message
3. If `ZodError` → 400 with validation issues
4. If Postgres error with specific codes → 503 (connection) or 409 (duplicate)
5. Otherwise → 500 with generic message + requestId
6. All errors with status ≥ 500 are logged via pino with requestId

## Frontend Error Handling (`src/api/httpClient.ts`)

- `ApiError` class with `status` + `data` fields
- Network errors → `{ message: 'Servidor indisponível...' }`
- 401 → auto refresh or redirect to login
- Non-OK responses → throw `ApiError(status, parsedBody)`
- Components/hooks handle via React Query's `onError` or try/catch

## Performance Optimizations

- **Code splitting**: Every page is lazy-loaded
- **Bundle chunking**: Vite configured with `manualChunks` for React, lucide-react icons, and other vendor code
- **React Query caching**: 2-min stale time, 5-min GC, prevents redundant API calls
- **DB indexes**: Comprehensive index strategy defined per domain
- **Rate limiting**: Configurable per-route, Redis support for multi-instance deployments

## Prometheus Metrics

Middleware tracks request count, duration, errors, and active requests via `prom-client`. Paths are normalized (UUIDs → `:uuid`) for clean metric labels. Exposed at `GET /api/metrics`.

## Graceful Shutdown

The server handles `SIGTERM`/`SIGINT` with:
1. Checks database connectivity; returns 503 if database is down
2. Closes HTTP server
3. Forces exit after 10-second timeout

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[ARCHITECTURE]] · [[Módulos Core do Backend]]
