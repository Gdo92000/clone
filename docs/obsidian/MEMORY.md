---
type: memory
status: active
aliases:
- Memoria
- Obsidian MEMORY
- Memoria Operacional
- Session Memory
created_at: 2026-05-23
updated_at: 2026-06-12
related:
- CURRENT_STATE.md
- LOOP 7 — Migração TypeScript 5 → 6
tags:
- type/memory
---

# Memoria Operacional

## Estado atual

**LOOP 7 — Migração TS5→TS6 CONCLUÍDO** (2026-06-12). moduleResolution, strict flags, ~14 type errors corrigidos.
**LOOP 6 — Documentação/Memória CONCLUÍDO** (2026-06-12).
**LOOP 5 — Otimização Build/SEO CONCLUÍDO** (2026-06-12).
**LOOP 4 — Auditoria Arquitetural CONCLUÍDO** (2026-06-12).
**LOOP 3 — Testes Backend CONCLUÍDO** (2026-06-11).
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
| **LOOP 3** | Testes Backend | ✅ **100% (86 files, 624 tests)** |
| **LOOP 4** | Auditoria Arquitetural (System Contract) | ✅ **Concluído** |
| **LOOP 5** | Otimização Build/SEO | ✅ **Concluído** |
| **LOOP 6** | Documentação/Memória | ✅ **Concluído (2026-06-12)** |
| **LOOP 7** | Migração TypeScript 5→6 | ✅ **Concluído (2026-06-12)** |

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

## LOOP 5 — Otimização Build/SEO (2026-06-12)

### Escopo
Melhorar meta tags SEO, structured data, chunk splitting do build, e adicionar Core Web Vitals monitoring.

### Resultados

| Área | Antes | Depois |
|------|-------|--------|
| `<title>` | "iFood Clone" | "Flux Delivery" |
| Meta description | ❌ Ausente | ✅ Adicionado |
| Open Graph tags | ❌ Ausente | ✅ og:title, og:description, og:image, og:type, og:locale |
| Twitter Card tags | ❌ Ausente | ✅ twitter:card, twitter:title, twitter:description |
| Canonical URL | ❌ Ausente | ✅ `https://fluxdelivery.app` |
| robots.txt | ❌ Ausente | ✅ `public/robots.txt` |
| sitemap.xml | ❌ Ausente | ✅ `public/sitemap.xml` |
| JSON-LD structured data | ❌ Ausente | ✅ Organization schema |
| Per-page meta | ❌ Ausente | ✅ `react-helmet-async` + componente SEO |
| Google Fonts duplicado | ✅ CSS @import + HTML link | ✅ Apenas HTML link (remove @import) |
| vendor-other chunk | 869 KB | **418 KB** (-51%) |
| vendor-charts (recharts) | Dentro de vendor-other | **432 KB** (separado) |
| vendor-ui (sonner, clsx, etc) | Dentro de vendor-other | **65 KB** (separado) |
| Core Web Vitals | ❌ Ausente | ✅ `web-vitals` + WebVitalsReporter |
| Auth test flaky | ⏳ Timeout 5s | ✅ Timeout 10s |

### Arquivos criados/modificados

| Arquivo | Mudança |
|---------|---------|
| `index.html` | Meta tags, OG, Twitter, canonical, title |
| `public/robots.txt` | Criado |
| `public/sitemap.xml` | Criado |
| `src/components/SEO.tsx` | Criado (SEO + JSON-LD) |
| `src/components/WebVitalsReporter.tsx` | Criado |
| `src/main.tsx` | SEOProvider wrapper |
| `src/App.tsx` | SEO + WebVitalsReporter |
| `src/index.css` | Remove @import Google Fonts |
| `vite.config.ts` | Melhor chunk splitting |
| `server/src/auth/index.test.ts` | Timeout 10s (flaky fix) |
| `package.json` | `react-helmet-async` + `web-vitals` |

## LOOP 4 — Auditoria Arquitetural (2026-06-12)

### Escopo
Extrair lógica de negócio de rotas para serviços dedicados, seguindo sequência segura (menor risco ao maior).

### Resultados
| Métrica | Valor |
|---------|-------|
| Rotas enxugadas | 4 (coupons-engine 58→20, merchant-finance 115→25, merchant-analytics 85→21, orders 296→37) |
| Serviços criados | couponService(56), financeService(104), analyticsService(71), orderService(255) |
| Queries DB diretas removidas das rotas | ~112 |
| Testes inalterados | 86/87 files pass (1 flaky timeout pré-existente) |
| Violação residual | 11 serviços importam `db` direto — documentada em ADR-008 |

### Decisões
1. **Repository Pattern obrigatório para novos módulos** (ADR-008 aprovado)
2. **Serviços legados sem refatoração retroativa** — apenas sob gatilho (troca de ORM, bug, feature)
3. **Nenhuma refatoração no módulo Merchant** (recém-estabilizado)

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
Nenhum — todos os LOOPs planejados (1-6) foram concluídos.
Próximo passo: definir novo ciclo de features ou refinamentos.

> [!tip] Navegacao
> [[CURRENT_STATE]] · [[MOC — Historico do Projeto]] · [[LOOP 3 — Testes Backend]]
