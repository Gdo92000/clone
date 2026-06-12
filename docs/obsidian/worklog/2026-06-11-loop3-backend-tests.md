---
title: LOOP 3 — Testes Backend
type: worklog
status: concluded
created_at: 2026-06-11
updated_at: 2026-06-11
related:
  - MEMORY.md
  - CURRENT_STATE.md
  - server/src/services/loginLockout.ts
tags:
  - type/worklog
  - loop/3
---

# LOOP 3 — Testes Backend Faltantes

## Escopo

Cobrir todas as rotas, serviços, libs, middleware, auth e DB do backend com testes.

## Resultados

| Métrica | Antes | Depois |
|---------|-------|--------|
| Server test files | 34 | **87** |
| Server tests | 393 | **650** |
| Full suite tests | 393 | **851** |
| Full test files | 46 | **108** |
| Lint errors | 0 (3 warnings) | **0 erros, 0 warnings** |
| DB test lint errors | 149 | **0** |

## Cobertura

- **Middleware 11** (55+ testes): poC, auth, planLimits, tenant, permission, feature, securityHeaders, requestId, rateLimit, metrics, domain
- **Auth 2** (16 testes): index, local/provider
- **Serviços 12** (125+ testes): cleanupAuthSessions, redisRateLimitStore, rateLimitStore, sse, push, auditLogService, loginLockout, cityAvailabilityService, operations/ (3), orders/mirrorService, printing/ (2)
- **Lib 7** (46 testes): environmentRuntime, tenant, logger, cookieConfig, circuitBreaker, requestContext, health, errors, resilience/index
- **DB 5** (35 testes): provider, provider-selector, registry-memory, repositories/base-memory
- **Rotas 44** (370+ testes): todas as rotas do backend
- **Outros 4** (67 testes): telemetry/router, replay/recorder, fixtures/serializer, fixtures/load-fixture, contract/endpoint-parity

## Bug corrigido

- `loginLockout.ts:23` — condição `now >= existing.lockoutUntil` sempre verdadeira quando `lockoutUntil = 0` (nunca bloqueado causava reset de contagem)
- `loginLockout.ts:34` — `isLockedOut` deletava entrada com `lockoutUntil === 0`

## Patches de lint aplicados

- `vi.mocked(db.select)` → `const mockedDb = vi.mocked(db)` (16 arquivos) — resolve `unbound-method`
- `_c, next` → `_c, next: () => Promise<void>` (11 arquivos) — resolve `no-unsafe-call`
- `async` removido de callbacks sem `await` (5 arquivos) — resolve `require-await`
- `sse.test.ts`: floating promise com `void`, `route` → `_route`
- `base-memory.test.ts` (139 err): `import type` + `Record<string, unknown>` + construtores tipados
