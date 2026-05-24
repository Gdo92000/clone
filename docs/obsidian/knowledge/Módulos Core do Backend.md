---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/architecture
---

# Módulos Core do Backend

## server/src/lib/

| Módulo | Arquivo | Descrição |
|---|---|---|
| Logger | `logger.ts` | Pino com contexto de request; log estruturado com `requestId`, `userId`, `tenantId` |
| Erros | `errors.ts` | Erros tipados com `code`/`statusCode`, enriquecimento de stacktrace |
| Tenancy | `tenant.ts` | `getTenantId()` por JWT, `validateTenantAccess()`, `tenantIsolationMiddleware()` |
| Health | `health.ts` | Verificações de saúde (DB + dependências externas) |
| Request Context | `requestContext.ts` | `AsyncLocalStorage` para `requestId`/`tenantId`/`userId` por request |
| Circuit Breaker | `circuitBreaker.ts` | CLOSED → OPEN → HALF_OPEN, state por nome, `circuitBreakerCall(fn)` |
| Environment Runtime | `environmentRuntime.ts` | `initRuntime(env)` — bootstrap auto-completo postgres↔memory |

## Logger
```typescript
import { logger } from '../lib/logger';
logger.info('Restaurante criado', { id: 'r1', tenantId: 't1' });
logger.warn('Taxa de erro alta', { service: 'pagamentos', errorRate: 0.34 });
logger.error('Falha ao conectar', new Error('timeout'), { retryable: true });
```

## Tenant Isolation
```typescript
// Aplicado globalmente nas rotas não-públicas
app.use('/api/*', tenantIsolationMiddleware());

// Uso dentro de handlers
const tenantId = c.get('tenantId'); // injetado pelo middleware
```

## Circuit Breaker
```prototype
call: CLOSED                  → sucesso: CLOSED | falha: contador++
                    falha >= threshold: OPEN
  OPEN        → timeout passou: HALF_OPEN (probing)
HALF_OPEN → successes >= successThreshold: CLOSED
```

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[MOC — Guias de Desenvolvimento]]
