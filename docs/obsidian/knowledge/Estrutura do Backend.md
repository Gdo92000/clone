---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/architecture
---

# Estrutura do Backend — pasta server/src/

```
server/src/
  index.ts              entrypoint do Hono (CORS + rotas)
  config.ts             validação Zod de variáveis de ambiente
  auth/                 middleware JWT + rotas de autenticação (/login, /me)
  db/                   drizzle ORM + provider selector + registry + fixtures
  lib/                  logger, circuitBreaker, tenant, health, errors, environmentRuntime
  middleware/            tenant isolation + rate limiting
  ports/                RepositoryPort, Filter, TransactionPort — contratos puros
  replay/               recorder stub (FASE 20)
  routes/               38 arquivos de rota por domínio
  services/             serviços de domínio isolados da camada HTTP
  telemetry/            router stub (FASE 19)
  types/                tipos globais do projeto
  validations/          schemas Zod p/ dados POST no backend
  chaos/                chaos router stub (FASE 21)

```

## server/src/services/
```
coverageCityService.ts   CRUD de cidades de cobertura
loginLockout.ts           lockout por IP após N tentativas
auditLogService.ts        escrita de eventos de auditoria
cleanupAuthSessions.ts    limpeza periódica de tokens expirados
operations/               lógica de horário de funcionamento
printing/                 auto-impressão de pedidos de cozinha
redisRateLimitStore.ts    store de rate limit com Redis (fallback memória)
rateLimitStore.ts         stub rate limit
sse.ts                    multi-room SSE stream
```

## Padrão de Services
```typescript
// Services recebem registry por injeção de dependência
export class CoverageCityService {
  constructor(private readonly registry: Registry) {}

  async findAll(tenantId?: string) {
    return this.registry.repos.coverageCities.findMany({ orderBy: { created_at: 'desc' } }, tenantId);
  }

  async findRegisteredCityCoverage(city: string): Promise<CityCoverage | null> {
    // usado como single truth pela busca de proximidade
    const cities = await this.registry.repos.coverageCities.findMany();
    return cities.find(c => c.name.toLowerCase() === city.toLowerCase()) ?? null;
  }
}
```

## Middlewares
```typescript
tenantIsolationMiddleware()  — injeta tenantId no contexto, bloqueia rotas sem token
rateLimitMiddleware() — aplica RedisRateLimitStore antes de handler chegar
```

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[Rotas da API]]
