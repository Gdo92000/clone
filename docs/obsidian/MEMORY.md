---
type: memory
status: active
aliases:
- Memoria
- Obsidian MEMORY
- Memoria Operacional
- Session Memory
created_at: 2026-05-23
updated_at: 2026-06-11
related:
- CURRENT_STATE.md
- LOOP 3 — Testes Backend Faltantes
tags:
- type/memory
---

# Memoria Operacional

## Estado atual

**LOOP 3 — Testes Backend CONCLUÍDO** (2026-06-11). 87 server test files, 650 testes. Full suite: 108 files, 851 testes. Lint 0 erros, 0 warnings. Build limpo.
**LOOP 2 — Pipeline CI/CD CONCLUÍDO** (2026-06-10).
**LOOP 1 — TypeScript Backend Cleanup CONCLUÍDO** (2026-06-10).
Percentual Merchant: ~90%. Qualidade do código restaurada.

| Fase | Descricao | Status |
|------|-----------|--------|
| **38** | Unificar menu_items + merchant_menu_items | ✅ schema + rotas + seeds + migration |
| **39** | CRUD additives + fix findAdditives + JOIN rotas publicas | ✅ repos + rotas + carrinho |
| **40** | Push Notifications (Web Push API + service worker) | ✅ implementado |
| **41** | Analytics e Financeiro (recharts, endpoints, hooks, MSW) | ✅ completo |
| **42** | Remocao modulo Enterprise orfao (14 arquivos deletados) | ✅ auditoria + cleanup |
| **43** | Fluxo condicional delivery/pickup (backend + frontend + testes) | ✅ implementado |
| **Fase A** | Bloqueadores produção (multi-tenant, plan limits, taxas) | ✅ completo |
| **Fase B** | SSE no KDS + Push Merchant | ✅ completo |
| **LOOP 1** | TypeScript Backend Cleanup | ✅ **100% (0 err TS, 0 err lint)** |
| **LOOP 2** | Pipeline CI/CD | ✅ **Concluído** |
| **LOOP 3** | Testes Backend | ✅ **100% (87 files, 650 tests, lint 0/0)** |
| **LOOP 4** | Auditoria Arquitetural (System Contract) | ⏳ Pendente |
| **LOOP 5** | Otimização Build/SEO | ⏳ Pendente |
| **LOOP 6** | Documentação/Memória | ⏳ Pendente |

## LOOP 1 — TypeScript Backend Cleanup

### Problema
- `@typescript-eslint/no-explicit-any: error` com tolerância zero
- `base-postgres.ts` usava `any` internamente (tipagem genérica `TTable extends PgTable`)
- `registry.ts` acumulou tipos mortos (`TTablesSelect`, `TablesSelect`, `_TPostgresRow`)
- Rotas usavam `as string` redundante em `c.get('userBranchId')`
- `orders.ts` usava `as any` para cast de enum de status
- `orders.test.ts` com 14 erros de tipo nos mocks Hono
- TS6307 em `tsconfig.json` (arquivos fora do include)

### Solução
1. **base-postgres.ts** — reescrito sem `any`. `PgTable` concreto (não genérico) + `PostgresJsDatabase<Record<string, unknown>>`. `Db` type exportado. `withTransaction` removido (não está na `RepositoryPort`).
2. **registry.ts** — `Repositories` simplificado: `RepositoryPort` sem genérico. Imports limpos.
3. **registry-memory.ts** — `T extends Record<string, unknown>`.
4. **fixtures/loader.ts** — `as unknown as` para cast de Repositories. Guard `repo?.reset?.()`.
5. **fixtures/registry-shots.ts** — funções síncronas.
6. **Rotas** — `as string` removido de `c.get()`.
7. **orders.ts** — `customerStatus as any` → `as 'confirmed' | ... | 'cancelled'`.
8. **orders.test.ts** — 14 fixes de mock.
9. **tsconfig.json** — `"../shared"` adicionado ao include.

### Trade-off arquitetural
`Repositories` perdeu o genérico de entidade. Dados retornados são `Record<string, unknown>`. Decisão forçada pelo Drizzle v0.45+ — impossibilitando abstração genérica sobre `PgTable`.

## LOOP 2 — Pipeline CI/CD
1. **`.github/workflows/ci.yml`** — Node 22, `npm ci`, lint → build → test
2. **`.gitignore`** restaurado

## LOOP 3 — Testes Backend Faltantes

### Escopo
Cobrir todas as rotas, serviços, libs, middleware, auth e DB do backend.

### Resultados
| Métrica | Antes | Depois |
|---------|-------|--------|
| Server test files | 34 | **87** |
| Server tests | 393 | **650** |
| Full suite tests | 393 | **851** |
| Lint errors | 0 (3 warnings) | **0 erros, 0 warnings** |
| DB test lint errors | 149 | **0** |

### Principais patches de lint
- **`unbound-method`**: `vi.mocked(db.select)` → `const mockedDb = vi.mocked(db)` em 16 arquivos
- **`no-unsafe-call`**: `next: () => Promise<void>` anotado em mocks de middleware (11 arquivos)
- **`require-await`**: `async` removido de 5 callbacks
- **DB tests**: `base-memory.test.ts` (139 err) — tipagem com `import type` + `Record<string, unknown>`. `provider.test.ts` (6 err) — `EnvConfig` tipado. `provider-selector.test.ts` (4 err) — `getCapabilities()`.

### 44 Rotas + serviços + lib + middleware + auth + DB
Cobertura total: middleware (55+ testes), auth (16), serviços (125+), lib (46), DB (35), rotas (370+), outros (67).

### Bug corrigido
- `loginLockout.ts:23,34` — condição `lockoutUntil = 0` causava reset de contagem e deleção indevida.

## Decisoes-chave (LOOP 3)

- **`mockedDb` pattern**: `vi.mocked(db)` retorna objeto mockado inteiro → acesso `mockedDb.select` sem separar método de `this`.
- **Middleware mock tipagem**: `mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => ...)` — sem `async function` sem tipo, `next` vira `Function` e dispara `no-unsafe-call`.
- **`holidays.test.ts` sem `as unknown as`**: `const mockMiddleware: MiddlewareHandler = async (c, next) => ...` em vez de cast.
- **DB test types**: `EntityStore`/`BaseMemoryRepository` tipados com `import type` + construtores `new (namespace: string) => EntityStore` — elimina 139 erros de `any`.

## Progresso consolidado
- Fases 1-24, 25-43, Fase A, Fase B concluídas
- LOOP 1 (TypeScript cleanup) ✅
- LOOP 2 (CI/CD) ✅
- LOOP 3 (Testes backend) ✅
- **87 server test files, 650 testes — 0 falhas, 0 lint, 0 build**

## Pendente (prioridade)
1. **LOOP 4 — Auditoria Arquitetural**: System Contract, invariantes L1-L6, FSM
2. **LOOP 5 — Otimização Build/SEO**: Bundle size, Core Web Vitals, GEO
3. **LOOP 6 — Documentação/Memória**: ADRs, knowledge base

> [!tip] Navegacao
> [[CURRENT_STATE]] · [[MOC — Historico do Projeto]] · [[LOOP 3 — Testes Backend]]
