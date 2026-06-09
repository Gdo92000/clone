---
type: memory
status: active
aliases:
- Memoria
- Obsidian MEMORY
- Memoria Operacional
- Session Memory
created_at: 2026-05-23
updated_at: 2026-06-09
related:
- CURRENT_STATE.md
tags:
- type/memory
---

# Memoria Operacional

## Estado atual

**Fases 38-43 commitadas. Fase A — Bloqueadores Produção + Fase B — SSE/Push Merchant CONCLUÍDAS** (2026-06-09, working tree).
Percentual Merchant estimado: ~88% (antes ~68%).

| Fase | Descricao | Status |
|------|-----------|--------|
| **38** | Unificar menu_items + merchant_menu_items | ✅ schema + rotas + seeds + migration |
| **39** | CRUD additives + fix findAdditives + JOIN rotas publicas | ✅ repos + rotas + carrinho |
| **40** | Push Notifications (Web Push API + service worker) | ✅ implementado |
| **41** | Analytics e Financeiro (recharts, endpoints, hooks, MSW) | ✅ completo |
| **42** | Remocao modulo Enterprise orfao (14 arquivos deletados) | ✅ auditoria + cleanup |
| **43** | Fluxo condicional delivery/pickup (backend + frontend + testes) | ✅ implementado |

### Fase 38 — Unificacao menu_items

- `menu_items` agora tem `branch_id` (FK → branches), `is_visible_to_consumer` (default true), `updated_at`
- `merchant_menu_items` deprecada no schema (mantida para compatibilidade de migration; sera DROPada em migration futura)
- Relations atualizadas: `branchesRelations.menuItems` (era `merchantMenuItems`)
- Rotas publicas filtram por `is_visible_to_consumer = true`
- Convencao `restaurant_id = branch_id` mantida (mirrorService)
- Migration `0015_many_puff_adder.sql` gerada (ALTER TABLE + FK + 2 indexes)
- Seed atualizado: plans, company, branches, 16 menu items reais
- `menu_items` NUNCA era escrita por codigo antes desta fase

### Fase 39 — Additives

- `findAdditives()` bug corrigido: `eq(additives.id, menuItemId)` → `eq(additives.menu_item_id, menuItemId)` (Postgres + Memory repo)
- Memory repo: `addons` field removido, filtro por menuItemId implementado
- Rotas publicas (menu-items.ts, index.ts): additives embutidos via query individual por item (loop `sql` template)
- `branches.ts`: CRUD completo de additives — `POST/PUT/DELETE /:id/menu-items/:itemId/additives`
- `CartContext.tsx`: `additiveSetsEqual()` compara additives por IDs ao verificar item duplicado no carrinho
- Seeds: 22 registros de additives cobrindo itens rest-1 a rest-9
- `ON DELETE CASCADE` em `additives → menu_items`

### Fase 41 — Analytics e Financeiro

- Endpoints server-side: `server/src/routes/merchant-analytics.ts` e `merchant-finance.ts`
- Graficos recharts: `FxLineChart`, `FxBarChart`, `FxPieChart` em `src/components/charts/`
- Hooks: `useMerchantAnalytics`, `useMerchantFinance`
- MSW handlers + fixtures para testes offline
- Tipos e DTOs desacoplados de entidades DB
- `FxPieChart` usa `fill` diretamente no `<Pie>` (nao `<Cell>`) — compatibilidade recharts v3+

### Fase 42 — Remocao modulo Enterprise orfao

- Auditoria completa: 4 paginas nunca roteadas, dados mock duplicados, repositorios stub sem consumidor, backend inexistente
- 14 arquivos deletados (paginas, enterpriseData, searchEnterprise, types, repos, service, domain, schema)
- Preservados `usePlanLimits`, `useAuditLog`, `auditApi` (usados por outros modulos)
- `DemoDataPage` migrada para dados inline
- Conclusao: plano "Enterprise" nunca existiu no backend (`planId` enum so `basic|pro|premium`)

### Fase 43 — Fluxo condicional delivery/pickup

- **State machine**: `shared/orders/orderStateMachine.ts` — `ready: ['dispatched', 'delivered']`
- **Backend** (`server/src/routes/orders.ts`):
  - `delivery_type` incluido no SELECT inicial do merchant
  - `ALLOWED` condicional: delivery `ready→dispatched`, pickup `ready→delivered` (entrega sem gestao de frota)
  - Sync `merchantOrders→orders` na mesma transacao via `MERCHANT_TO_CUSTOMER_STATUS`
  - SSE publicado em `user:{customerUserId}` alem de `branch:{branchId}`
  - Push diferenciado por `delivery_type` (pickup nunca recebe "saiu para entrega")
- **Frontend**:
  - `MerchantOrdersPage.tsx`: `NEXT_STATUS_MAP` por `delivery`/`pickup` — botao "Avancar status" dinamico
  - `TrackingPage.tsx`: `getStatusSteps(deliveryType)` — delivery 5 steps (inclui "Saiu para entrega"), pickup 4 steps (sem essa etapa)
  - `FxOrderStatus` renderiza steps recebidos — nunca mostra "Saiu para entrega" para pickup
- **Testes**: 18 testes (10 backend Hono + 8 frontend steps)

### Lint/Typecheck/Build — Validados

- ESLint `strictTypeChecked` nao resolve tipos Drizzle de colunas fora do tsconfig include
- Workaround: `sql` template literal (`sql`menu_item_id = ${id}``) em vez de `eq(additives.menu_item_id, id)`
- `rows.at(0)` em vez de desconstrucao `[item]` para evitar `no-unnecessary-condition`
- `_branchId` prefix para vars destruturadas nao usadas (convencao `_` permitida pelo lint)
- `react-refresh/only-export-components` warnings no `TrackingPage.tsx` (exporta hooks + componentes) — warning aceito, nao erro

**393 testes (34 files)** — ✅ 100% passando. Lint 0 erros, typecheck 0 erros, build sucesso.

### Ajustes relevantes

- **orders.test.ts flaky**: 2 testes de transição de status (ready→dispatched, dispatched→delivered) tinham timeout próximo a 5000ms devido a `import()` dinâmico do módulo Hono. Após otimização de cache do Vitest, passam consistentemente em ~3000-4200ms.
- **Push merchant implementado em orders.ts**: busca `users` com `role='merchant'` e `branch_id`, depois `pushSubscriptions`. Mesmo padrão de `consumer-orders.ts`. Mensagem: `"Pedido #{id} atualizado para: {status}"`.

### Pendente

- (nada — todas as tarefas concluídas)

> [!tip] Navegacao
> [[CURRENT_STATE]] · [[MOC — Historico do Projeto]] · [[Learnings Fases 41-43]]

## Progresso consolidado

- Fases 1-24 concluidas (codigo + infraestrutura)
- Fases 1-5 (auditorias): seguranca, React runtime, camadas L1-L6, PWA/offline, performance
- Fases 15-24 (enterprise): memory repo, contract schemas, env runtime, snapshots, telemetry, replay, chaos, resilience, IndexedDB, proximity
- **Fase 25** — Geocodificacao (refatoracao 8 ajustes)
- **Fase 26** — Pipeline de Geocoding + Persistencia de Enderecos/Filiais (2 sub-fases)
- **Fase 27** — Governanca de Geocoding + Auditoria de Franca
- **Fase 28** — Remocao de mockCoverageCities + Cobertura Geofencing-Ready
- **Fase 29** — Coordenadas reais (8 restaurants) + Bahia Lanches + ViaCEP address-lookup + Mobile
- **Fase 30** — Mock Cleanup + Correcoes runtime (coerceNumeric, normalizeStateBR, CITY_TTL=0)
- **Fase 31** — Mobile First Correction (25/25 itens — touch targets, modais, grids, a11y)
- **Fase 32** — Saneamento /merchant curto prazo (6 itens)
- **Fase 33** — Checkout→Tracking→Catalog + Auth + Idempotency-Key (migration 0012 aplicada)
- **Fase 34** — FK Constraints (migration 0013 — 4 FKs)
- **Fase 35** — Materializar 8 FKs restantes (migration 0014 — 53/53)
- **Fase 36** — State Machine compartilhada + SSE real
- **Fase 37** — KDS (board visual + timers + som)
- **Fase 38** — Unificar menu_items + merchant_menu_items (migration 0015 gerada)
- **Fase 39** — CRUD additives + fix findAdditives + JOIN rotas publicas + carrinho
- **Fase 41** — Analytics e Financeiro (recharts + hooks + endpoints + MSW)
- **Fase 42** — Remocao modulo Enterprise orfao (14 arquivos)
- **Fase 43** — Fluxo condicional delivery/pickup (state machine, sync, SSE bidi, push, tracking steps)

## Decisoes-chave

- **Unificacao Opcao A**: tabela unica `menu_items` substitui `merchant_menu_items`. Merchant e consumer leem a mesma fonte.
- **Convencao `restaurant_id = branch_id`**: mirrorService ja usa (`findBranchForRestaurant`). Sem constraint estrutural — e convencao, nao garantia.
- **JSONB snapshot preservado**: `order_items.additives` (JSONB) mantem historico mesmo se merchant alterar/excluir adicionais depois.
- **merchant_menu_items deprecada mas nao removida**: tabela ainda definida no schema para compatibilidade de migration; sera DROPada em migration futura.
- **findAdditives() bug critico**: consultava `WHERE id = menuItemId` em vez de `WHERE menu_item_id = menuItemId` — nunca retornava resultados.
- **State machine inline no backend**: `shared/orders/orderStateMachine.ts` e o contrato canonico. Validacao runtime inlinada para evitar conflito entre Drizzle "error types" e ESLint strictTypeChecked.
- **Zod como bridge de tipos**: `merchantStatusEnum.parse()` converte valores Drizzle em tipos union concretos do Zod.
- **Polling 5s para KDS**: SSE ideal mas polling simplifica implementacao inicial.
- **53 FKs no DB**: schema Drizzle e banco PostgreSQL em sincronia total.
- **Workaround strictTypeChecked + Drizzle**: `sql` template literal para queries em colunas additives; `rows.at(0)` para evitar `no-unnecessary-condition` em resultados de query Drizzle.
- **Transicoes condicionais por delivery_type**: `ALLOWED` no backend e `NEXT_STATUS_MAP` no frontend replicam a mesma logica — sem gestao de frota, `ready→dispatched` so para delivery.
- **SSE cliente no merchant**: `useMerchantSSE.ts` substitui polling no KDS. Backoff exponencial. Branch-aware.
- **Sync via mapping tabelas separadas**: `orders` (cliente) e `merchantOrders` (merchant) tem enums diferentes. `MERCHANT_TO_CUSTOMER_STATUS` mapeia `rejected→cancelled`, `accepted→preparing`, etc.
- **SSE bidi**: publica em `branch:{branchId}` (merchant escuta) E `user:{customerUserId}` (cliente escuta via `/api/realtime/orders` com `Authorization` header).
- **Push mensagens distintas**: `statusMessages` tem blocos separados `delivery` e `pickup`. Pickup nunca contem chave `dispatched`.
- **FxPieChart sem `<Cell>`**: recharts v3+ aceita `fill` diretamente no `<Pie>` — evita warning de `unique key` e simplifica o componente.
- **TrackingPage sem dispatched para pickup**: `getStatusSteps(deliveryType)` retorna 4 steps (exclui `dispatched`) para pickup. Testes validam comprimento e ausencia. `FxOrderStatus` renderiza apenas steps recebidos.
- **Plano Enterprise removido**: inexistente no backend (`planId` enum so `basic|pro|premium`); paginas orfas, dados mock duplicados, repositorios sem consumidor.
