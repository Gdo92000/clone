---
type: memory
status: frozen
aliases:
- Memoria
- Obsidian MEMORY
- Memoria Operacional
- Session Memory
created_at: 2026-05-23
updated_at: 2026-06-14
related:
- CURRENT_STATE.md
- LOOP 8 — Zod + OpenAPI Single Source of Truth
- Correções Mobile First (D1-D6)
tags:
- type/memory
---

# Memoria Operacional

## Estado atual

**LOOP 8 — Zod + OpenAPI Single Source of Truth CONCLUÍDO** (2026-06-13). Build ✅, Lint ✅ 0 erros, Testes ✅ 852/852 (108 files), OpenAPI gen ✅.
**LOOP 7 — Migração TS5→TS6 CONCLUÍDO** (2026-06-12).
**LOOP 6 — Documentação/Memória CONCLUÍDO** (2026-06-12).
**LOOP 5 — Otimização Build/SEO CONCLUÍDO** (2026-06-12).
**LOOP 4 — Auditoria Arquitetural CONCLUÍDO** (2026-06-12).
**LOOP 3 — Testes Backend CONCLUÍDO** (2026-06-11).
**LOOP 2 — Pipeline CI/CD CONCLUÍDO** (2026-06-10).
**LOOP 1 — TypeScript Backend Cleanup CONCLUÍDO** (2026-06-10).

| Fase | Descricao | Status |
|------|-----------|--------|
| **38** | Unificar menu_items + merchant_menu_items | ✅ Schema unificado. Legacy `merchant_menu_items` mantida para compatibilidade. |
| **39** | CRUD additives + fix findAdditives + JOIN rotas publicas | ✅ repos + rotas + carrinho |
| **40** | Push Notifications (Web Push API + service worker) | ✅ implementado |
| **41** | Analytics e Financeiro (recharts, endpoints, hooks, MSW) | ✅ completo |
| **42** | Remocao modulo Enterprise orfao | ✅ Enxugado (3 arquivos ativos mantidos, 14 mortos removidos) |
| **43** | Fluxo condicional delivery/pickup (backend + frontend + testes) | ✅ implementado |
| **Fase A** | Bloqueadores produção (multi-tenant, plan limits, taxas) | ✅ completo |
| **Fase B** | SSE no KDS + Push Merchant | ✅ completo |
| **LOOP 1** | TypeScript Backend Cleanup | ✅ **100% (0 err TS, 0 err lint)** |
| **LOOP 2** | Pipeline CI/CD | ✅ **Concluído** |
| **LOOP 3** | Testes Backend | ✅ **100% (108 files, 852 tests)** |
| **LOOP 4** | Auditoria Arquitetural (System Contract) | ✅ **Concluído** |
| **LOOP 5** | Otimização Build/SEO | ✅ **Concluído** |
| **LOOP 6** | Documentação/Memória | ✅ **Concluído (2026-06-12)** |
| **LOOP 7** | Migração TypeScript 5→6 | ✅ **Concluído (2026-06-12)** |
| **LOOP 8** | Zod + OpenAPI Single Source of Truth | ✅ **Concluído (2026-06-13)** |

## LOOP 8 — Zod + OpenAPI Single Source of Truth (CONCLUÍDO 2026-06-13)

### O que foi feito

1. **Schemas Zod + OpenAPI**: merchantWorkspace, superadmin, merchant (Zod v4 + @hono/zod-openapi)
2. **Migração de 15 rotas** para OpenAPIHono: plans, addons, subscriptions, feature-flags, invoices, companies, branches, orders, merchant-coupons, campaigns, merchant-analytics, merchant-finance, menu-items (público), merchant-workspace
3. **Schema paths corrigidos**: 13 paths em merchant.ts, 5 em superadmin.ts, 1 em merchantWorkspace.ts → relativos ao mount point
4. **41 test failures zerados**: 4 causas raiz (schema paths, Date mocks, auth mock, middleware order) + 2 field name mismatches (revenue→totalRevenue, grossRevenue→revenue)
5. **Rotas additives readicionadas**: POST/PUT/DELETE /:id/menu-items/:itemId/additives (perdidas na migração)
6. **Public route fix**: GET /api/push/vapid-public-key movido para sub-router público (estava atrás de authMiddleware causando 401)
7. **OpenAPI generation**: `npm run openapi:generate` funcional, `src/types/api.d.ts` atualizado
8. **Build/Lint/Testes**: ✅ todos passando

### Decisões-chave
- **Schema paths relativos**: Rotas OpenAPI usam paths relativos ao mount point (ex: `/merchant/branches` → `/`)
- **Middlewares separados**: push.ts usa sub-routers `publicRoute` + `protectedRoute` (padrão auth.ts)
- **Rotas híbridas**: branches.ts mantém rotas additives como Hono puro (não OpenAPI) por serem CRUD simples
- **Desserialização Date**: handlers convertem `Date | null` → `string` via `.toISOString()` para compatibilidade JSON

### Arquivos criados/modificados

| Arquivo | Mudança |
|---------|---------|
| `server/src/schemas/merchant.ts` | 13 paths corrigidos (absolutos → relativos ao mount point) |
| `server/src/schemas/superadmin.ts` | 5 paths corrigidos |
| `server/src/schemas/merchantWorkspace.ts` | 1 path corrigido |
| `server/src/routes/branches.ts` | Rotas additives readicionadas (perdidas na migração) |
| `server/src/routes/companies.ts` | `getAuthPayload` → `getTokenPayload` |
| `server/src/routes/plans.ts` | Rotas GET públicas movidas antes do middleware |
| `server/src/routes/push.ts` | Sub-routers público/protegido (fix 401 vapid-key) |
| `server/src/routes/*.test.ts` | 6 arquivos de teste corrigidos |
| `server/src/schemas/merchantWorkspace.ts` | Schema consolidado workspace |
| `docs/obsidian/CURRENT_STATE.md` | Atualizado (852/852) |

## LOOP 4 — Auditoria Arquitetural (2026-06-12) — CONCLUÍDO

4 rotas enxugadas (~112 queries DB removidas). 4 serviços criados: couponService, financeService, analyticsService, orderService.
**Decisões**: ADR-006 (tipos concretos > genéricos), ADR-007 (Test Pattern), ADR-008 (Repository Pattern p/ novos módulos).
11 serviços legados ainda importam `db` direto — violação residual documentada (ADR-008).

## Decisoes-chave (LOOP 3)

Padrões de teste formalizados no ADR-007: `mockedDb` pattern, middleware mock typing, fixture-based testing, dual-project Vitest config.

~~Todas as 7 pendências (D1-D7) corrigidas.~~ Nenhuma pendência ativa no momento.

## Bloqueadores críticos corrigidos (pós-auditorias)

| Item | Documentado como | Código atual | Correção confirmada em |
|------|-----------------|--------------|:----------------------:|
| Mobile nav (D3) | 🔴 13 nav items em `overflow-x-auto scrollbar-hide`, sem drawer | `DashboardLayout` com hamburger + sidebar + Outlet — `MerchantLayout` removido | **Código** |
| Modais sem scroll (D4) | 🟡 5 modais inline sem `max-h-[90vh]` | Componentes `Modal` e `BottomSheet` já possuem `max-h-[90vh]` + `overflow-y-auto` no content. Todas as 5 páginas usam `Modal` compartilhado. | **Código** — Pronto p/ correção |
| mirrorService sem transação (ADR-005) | 🔴 4 inserts fora de transação | `db.transaction()` na linha 123 de `mirrorService.ts` | **Código** |
| SSE sem isolamento tenant (C1) | 🔴 Qualquer user via qualquer branch | Validação por role em `sse.ts:30-48` + teste 403 | **Código** + **Teste** |
| Push sem authMiddleware (C3) | 🔴 subscribe sem guard consistente | `protectedRoute.use('*', authMiddleware)` em `push.ts:33` | **Código** |
| Botão voltar consumer (D6) | 🟡 4 páginas sem back navigation | `FxPageNavbar` com `backTo={ROUTES.HOME}` em OrderHistoryPage, ProfilePage, SearchPage, CityRestaurantsPage | **Código** |
| SSE reconexão (D1) | 🟡 Consumer SSE sem reconnect | `useSSE.ts` — exponential backoff com jitter (±50%), até 20 tentativas (~5 min) | **Código** |
| Touch targets (D5) | 🟡 6 componentes com < 44px | Todos atualizados: FxIconButton, FxQuantitySelector, CategoriesPage toggle, CityRestaurantsPage buttons, MerchantHolidaysPage inputs, ItemDetailPage checkbox | **Código** |
| cityCoverageFallback (D2) | 🟢 Fallback hardcoded de Franca | Substituído por `citiesApi.hasCityCoverage()` + `useActiveCities`. Arquivo deletado, 4 consumidores migrados | **Código** |
| ConsumerOrderDTO (D7) | 🟢 NUMERIC string sem coerção | `GET /me/orders` e `GET /me/orders/:id` — `Number()` em subtotal, total, delivery_fee, discount, items.price | **Código** + **5 testes** |
| Migration 0017 fora do journal (C7) | 🔴 Nunca aplicada em ambiente novo | `idx:14, tag:"0017_team_sub_role"` em `_journal.json` | **Código** |

## Decisões arquiteturais ativas

| ID | Título | Status | Impacto |
|----|--------|:------:|---------|
| ADR-001 | **ViaCEP como fonte oficial de bairro** — Priorização: ViaCEP > Nominatim neighbourhood > quarter > suburb. Preservar `originalNeighborhood` para auditoria. | ✅ Ativo | Geocoding |
| ADR-002 | **Proveniência e Confidence** — `coord_source`/`coord_confidence` no LocationState. Threshold 0.6 para cidade suportada. | ✅ Ativo | Location |
| ADR-003 | **Cobertura Geofencing-Ready** — `restaurants.is_active` como fonte única. 3 níveis: cidade, bairro, raio/polígono. | ✅ Ativo | Cobertura |
| ADR-004 | **DB Seed como Single Source of Truth para Dev** — Seed Franca auto-popula Postgres no boot. MSW agora é test-only + dev PC. | ✅ Ativo | Dev workflow |
| ADR-005 | **Mirror Service Atomicidade e Integridade** — `db.transaction` com 4 inserts, idempotency-key, validação menu items. | ✅ Implementado | Orders |
| ADR-006 | **Tipos concretos > genéricos no schema DB** — `RepositoryPort<Record<string, unknown>>` em vez de genéricos. | ✅ Ativo | DB layer |
| ADR-007 | **Test Pattern** — `mockedDb`, middleware typing, fixtures, dual-project Vitest. | ✅ Ativo | Testing |
| ADR-008 | **Repository Pattern para novos módulos** — Todo novo módulo DEVE usar interface + PostgresRepository + injeção. | ✅ Ativo | Architecture |
| ADR-009 | **Zod + OpenAPI Single Source of Truth** — Schemas Zod geram OpenAPI spec. Tipos frontend gerados via `openapi-typescript`. | ✅ Ativo | API contract |

## Restrições conhecidas do sistema

- **Postgres NUMERIC → string**: Drizzle serializa `numeric(10,2)` como string. `coerceNumeric()` nos mappers é obrigatório. 9 entidades afetadas, 16+ colunas. Mappers corrigidos: `restaurantMapper`, `addressMapper`, `merchantMapper`. Pendente: `consumerOrderMapper`.
- **Normalização de UF**: Nominatim retorna nome completo (ex: "São Paulo"), fixtures usam código ("SP"). `normalizeStateBR()` mapeia 27 UFs. Usado em `locationMachine.ts`, `LocationContext.tsx`, handlers MSW.

## Histórico arquitetural importante

- **Auth Architecture**: `IAuthProvider` pattern com `DevAuthProvider` (auto-login, 10 mock users, 8 roles) e `ProductionAuthProvider`. 17 permissions mapeadas. 20 cenários E2E validados. Documentação completa em `docs/architecture/auth-architecture.md`.
- **Chunk Splitting + SEO (LOOP 5)**: vendor-other 869KB→418KB. 5 vendor chunks. SEO: JSON-LD, OG/Twitter tags, sitemap, robots.txt, Core Web Vitals reporter.
- **Fase 28 — Migração Cobertura**: 12 arquivos deletados (whitelist `coverage_cities`). Cobertura agora derivada de `restaurants.is_active`.
- **Fase 29 — Coordenadas Reais**: 8 restaurantes com coordenadas Google Maps validadas. Rest-9 Bahia Lanches adicionado. ViaCEP enricher para bairro.
- **Fase 30 — Mock Cleanup**: 5 flags mortas removidas, 5 funções órfãs deletadas (~120 LOC). MSW mantido para testes + dev PC.

> [!tip] Navegacao
> [[CURRENT_STATE]] · [[ADR Index]] · [[MOC — Historico do Projeto]]
