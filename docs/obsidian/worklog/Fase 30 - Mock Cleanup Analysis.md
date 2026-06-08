---
type: worklog
status: concluded
created_at: 2026-06-06
updated_at: 2026-06-06
related:
  - "[[ADR-004 DB Seed como Single Source of Truth]]"
  - "[[CURRENT_STATE]]"
  - "[[MEMORY]]"
tags:
  - type/worklog
  - domain/core
  - layer/L1
aliases:
  - Mock Cleanup Plan
  - Plano de Eliminacao de Mocks
  - Fase 30
---

# Fase 30 — Mock Cleanup (análise + execução)

> Análise de impacto dos mocks + execução de eliminação (3 fases, 0 testes quebrados).

# Análise de Impacto — Mocks, Fixtures e MSW Handlers

> Inventário completo, classificação de uso e plano de eliminação faseada.

## TL;DR

| Categoria | Total arquivos | Usado em runtime dev? | Usado em testes? | Status |
|---|---|---|---|---|
| **Frontend MSW handlers** (`src/mocks/handlers/`) | 11 (10 + index) + 1 test | ✅ via Service Worker (PC) | ✅ Vitest | **MANTER** — único caminho para testes de componentes/hooks |
| **Frontend fixtures** (`src/mocks/fixtures/`) | 7 arquivos (6 domínios + index) | ✅同上 | ✅同上 | **MANTER** — fonte de dados de teste |
| **MSW infra** (`server.ts`, `browser.ts`, `toggle.ts`, `logger.ts`, `index.ts`) | 5 arquivos | ✅ runtime dev (PC) | ✅ | **MANTER** — orquestração |
| **Scenarios** (`src/mocks/scenarios/`) | 2 arquivos | ❌ só test/dev | ✅ | **MANTER** — 7 cenários validados |
| **Server fixtures** (`server/src/db/fixtures/`) | 4 arquivos (loader, serializer, registry-shots, index) | ❌ | ✅ 2 tests | **MANTER** — snapshot/restauro registry memory |
| **Dev-only flag** `__USE_MOCK__` | 3 locais | ✅ `main.tsx:7` | ✅ `vitest.config.ts:32,78` | **MANTER** — gate de bootstrap MSW |
| **MSW public worker** | 1 arquivo | ✅ PC only | ✅ | **MANTER** — Service Worker runtime |
| **Documentação MSW** | 2 notas | — | — | **ATUALIZAR** — drift detectado |

**Nenhum arquivo de mock pode ser removido** sem quebrar a suíte de testes (297 testes dependem de `src/test/setup.ts → src/mocks/server.ts → handlers → fixtures`).

A eliminação viável é **enxugar flags dev obsoletas** (`VITE_MOCK_RESTAURANTS`, `VITE_MOCK_ORDERS`, `VITE_MOCK_GEOCODING`, `__MOCK_RESTAURANTS__`, `__MOCK_ORDERS__`) e **documentar o split** dev (backend real) vs test (MSW).

---

## 1. Inventário completo

### 1.1 Frontend MSW (src/mocks/)

| Arquivo | Linhas | Importadores | Função |
|---|---|---|---|
| `browser.ts` | 29 | `index.ts`, `main.tsx:8` | `setupWorker` + `startMockServiceWorker()` |
| `server.ts` | 4 | `test/setup.ts:2`, `handlers/__tests__/handlers.test.ts:1` | `setupServer` para Vitest |
| `index.ts` | 3 | `main.tsx:8` | re-export public API |
| `logger.ts` | 14 | `browser.ts:3`, handlers | log colorizado de mock hits |
| `toggle.ts` | 32 | `browser.ts:4` | `window.__MSW_SCENARIO` setter runtime |
| `scenarios/index.ts` | 26 | `handlers/*` (5 arquivos), `toggle.ts`, `index.ts`, `__tests__/handlers.test.ts` | 7 cenários (default, empty_store, kitchen_congested, payment_declined, courier_offline, tenant_expired, merchant_blocked) |
| `scenarios/types.ts` | — | `scenarios/index.ts`, `handlers/*`, `toggle.ts` | union de ScenarioName |
| `fixtures/index.ts` | 7 | `handlers/__tests__/handlers.test.ts` (via handlers) | re-export |
| `fixtures/auth.ts` | 31 | `handlers/auth.ts:2` | users + loginMock |
| `fixtures/restaurants.ts` | 252 | `handlers/cities.ts:2`, `handlers/restaurants.ts:2` | categories, restaurants, menu, additives |
| `fixtures/merchant.ts` | — | `handlers/merchant.ts:5` | dados de empresas, pedidos, campanhas |
| `fixtures/subscriptions.ts` | — | `handlers/subscriptions.ts:4` | planos, addons |
| `fixtures/superadmin.ts` | — | `handlers/superadmin.ts:7`, `handlers/other.ts:7` | tenants, planos, loyalty |
| `fixtures/operations.ts` | — | `handlers/operations.ts:2`, `handlers/other.ts:2` | horários, holidays, theme |
| `fixtures/customer.ts` | — | `handlers/customer.ts:2` | addresses |
| `handlers/index.ts` | 25 | `browser.ts:2`, `server.ts:2` | combina 11 arrays de handlers |
| `handlers/auth.ts` | — | `handlers/index.ts:1` | POST /auth/login, GET /auth/me |
| `handlers/restaurants.ts` | — | `handlers/index.ts:2` | GET /restaurants, menu, filter |
| `handlers/merchant.ts` | — | `handlers/index.ts:3` | companies, orders, campaigns, coupons |
| `handlers/subscriptions.ts` | — | `handlers/index.ts:4` | subscription-addons toggle |
| `handlers/superadmin.ts` | — | `handlers/index.ts:5` | tenants, plans, loyalty |
| `handlers/operations.ts` | — | `handlers/index.ts:6` | open-status, holidays |
| `handlers/printing.ts` | — | `handlers/index.ts:7` | printer-config, print-history |
| `handlers/other.ts` | — | `handlers/index.ts:8` | theme, consumer, loyalty |
| `handlers/customer.ts` | — | `handlers/index.ts:9` | addresses |
| `handlers/cities.ts` | — | `handlers/index.ts:10` | coverage-cities |
| `handlers/__tests__/handlers.test.ts` | 222 | (auto) | 24+ testes dos 7 cenários |

### 1.2 Server fixtures (server/src/db/fixtures/)

| Arquivo | Linhas | Importadores runtime | Importadores test | Função |
|---|---|---|---|---|
| `index.ts` | 16 | — | (re-export) | barrel |
| `loader.ts` | 118 | — | `__tests__/fixtures/load-fixture.test.ts:6` | `loadFixture`, `loadDefaultFixture`, `readFixtureFile`, `writeSnapshotFile` |
| `serializer.ts` | 76 | — | `__tests__/fixtures/serializer.test.ts:5` | `serializeEntity`, `serializeEntities`, `assertSerializable` |
| `registry-shots.ts` | 114 | — | `__tests__/fixtures/load-fixture.test.ts` (via loader.ts:19) | `snapshotRegistry`, `restoreRegistry` |

⚠️ **Órfãos confirmados** (exportados mas nunca consumidos em runtime/test):
- `loadDefaultFixture` — declarado em `loader.ts:111`, **0 callers** (só aparece nos seus próprios tests)
- `readFixtureFile` — só usado por `loadDefaultFixture`
- `writeSnapshotFile` — **0 callers** em todo repo
- `snapshotRegistryJSON` (re-export) — só usado internamente por `writeSnapshotFile`
- `parseRegistryShot` (re-export) — **0 callers**

### 1.3 Flags dev

| Flag | Definida em | Lida em | Status |
|---|---|---|---|
| `__USE_MOCK__` | `vite.config.ts:47`, `vitest.config.ts:32,78` | `main.tsx:7`, `pages/dev/FlagsDebug.tsx:4` | ✅ **MANTER** — gate de bootstrap MSW |
| `VITE_MOCK` | `.env:42` | `vite.config.ts:26` | ⚠️ **OBSOLETO** — só usado como fallback legacy |
| `VITE_MOCK_RESTAURANTS` | `.env:48` | `vite.config.ts:27`, `vitest.config.ts:10` | ❌ **MORTO** — lido mas nunca consumido pelo código (verificado: `isMockRestaurants` em `flags.ts:12` usa `__MOCK_RESTAURANTS__` mas nenhum caller existe) |
| `VITE_MOCK_ORDERS` | `.env:49` | `vite.config.ts:28`, `vitest.config.ts:14` | ❌ **MORTO** — idem |
| `VITE_MOCK_GEOCODING` | `.env:50` | — | ❌ **MORTO** — não lido em lugar nenhum |
| `VITE_MOCK_MODE` | `.env:45` (comentado) | `vite.config.ts:26` | ⚠️ **LEGACY** — só se VITE_MOCK_RESTAURANTS/VITE_MOCK_ORDERS existirem |
| `__MOCK_RESTAURANTS__` | `vite.config.ts:34`, `vitest.config.ts:33,79` | `providers/flags.ts:9,13` | ❌ **MORTO** — `isMockRestaurants()` não tem callers |
| `__MOCK_ORDERS__` | `vite.config.ts:35`, `vitest.config.ts:34,80` | `providers/flags.ts:10,17` | ❌ **MORTO** — `isMockOrders()` não tem callers |
| `__DB_PROVIDER__` | `vite.config.ts:36`, `vitest.config.ts:35,81` | `infrastructure/ServiceProvider.tsx:31,39` | ✅ **MANTER** — controla memory vs postgres service composition |

### 1.4 Documentação

| Arquivo | Status |
|---|---|
| `docs/obsidian/knowledge/MSW — Mock Service Worker.md` | ⚠️ **STALE** — menciona `setupServer` import no example (correto) mas o `onUnhandledRequest: 'bypass'` mudou para `'error'` em `src/test/setup.ts:4`. Refere `scenarioContext.ts` que não existe. |
| `docs/obsidian/knowledge/Testes - MSW Handlers e Cenários.md` | ⚠️ **NÃO LIDO** (encoding quebrado no filename) — precisa de revisão |

---

## 2. Classificação de uso

### 2.1 DEV runtime (PC com cert confiável)

| Arquivo | Papel |
|---|---|
| `src/mocks/browser.ts` | Inicia Service Worker no PC |
| `src/mocks/toggle.ts` | `window.__MSW_SCENARIO` setter runtime |
| `src/mocks/scenarios/index.ts` | Estado mutável de cenário |
| `src/mocks/logger.ts` | Log colorizado de hits |
| `public/mockServiceWorker.js` | Service Worker (registrado pelo `setupWorker`) |
| `src/main.tsx:7-9` | Gate `if (__USE_MOCK__)` que decide se carrega MSW |
| `src/mocks/handlers/*` + `fixtures/*` | Atendidos via fetch interceptado pelo SW |

**Importante**: Com ADR-004 (DB seed), o backend é a fonte canônica. O MSW **ainda funciona no PC** mas é redundante — backend serve os mesmos dados (Franca). MSW no PC = "preview" dos dados (matches Postgres no momento).

### 2.2 Test runtime (Vitest)

| Arquivo | Papel |
|---|---|
| `src/test/setup.ts` | `beforeAll: server.listen({ onUnhandledRequest: 'error' })` |
| `src/mocks/server.ts` | Node MSW server (intercepta fetch em testes) |
| `src/mocks/handlers/index.ts` + todos os `handlers/*` | Respondem a `fetch()` durante tests |
| `src/mocks/handlers/__tests__/handlers.test.ts` | 24+ testes dos 7 cenários |
| `src/mocks/fixtures/*` | Fonte de dados para handlers |
| `src/mocks/scenarios/*` | Override de comportamento por cenário |
| `src/__tests__/**/*.test.{ts,tsx}` | Componentes/hooks testam contra MSW |
| `server/src/db/fixtures/{loader,serializer,registry-shots}.ts` | Snapshot/restore registry in-memory |
| `server/src/__tests__/fixtures/{load-fixture,serializer}.test.ts` | Testes do próprio snapshot machinery |

**Crítico**: 297 testes passam **graças a `src/test/setup.ts → server.ts → handlers → fixtures`**.

### 2.3 Dev runtime físico (mobile/LAN)

❌ **NÃO USA MSW** — Service Worker não registra com cert mkcert não confiável. ADR-004 (DB seed) resolve.

### 2.4 Storybook

❌ **NÃO EXISTE** (verificado: `.storybook` não existe).

### 2.5 Documentação

| Arquivo | Conteúdo | Ação |
|---|---|---|
| `MSW — Mock Service Worker.md` | Setup, cenários, flows | ⚠️ Atualizar (drift detectado) |
| `Testes - MSW Handlers e Cenários.md` | Patterns de teste | ⚠️ Revisar (encoding) |

---

## 3. Classificação por risco de remoção

### 🟢 SEGURO remover (não quebrará nada)

| Item | Motivo |
|---|---|
| `.env:50` `VITE_MOCK_GEOCODING` | Não lido em lugar nenhum |
| `vite.config.ts:28` flag `mockOrders` e lines 32-35 de define `VITE_MOCK_ORDERS`, `__MOCK_ORDERS__` | Dead code verificado |
| `vite.config.ts:27` flag `mockRestaurants` e define `VITE_MOCK_RESTAURANTS`, `__MOCK_RESTAURANTS__` | Dead code verificado |
| `vitest.config.ts:9-15, 33-34, 79-80` mesmo dead code | Idem |
| `src/vite-env.d.ts:4-5` declarations `__MOCK_RESTAURANTS__`, `__MOCK_ORDERS__` | Tipos para símbolos que não tem callers |
| `src/providers/flags.ts` inteiro | `isMockRestaurants()`, `isMockOrders()` — 0 callers |
| `src/pages/dev/FlagsDebug.tsx:5-6` linhas que listam as flags mortas | Verificar se outras linhas da page são usadas |
| `server/src/db/fixtures/loader.ts:39-54` `readFixtureFile`, `writeSnapshotFile` | Exportados mas 0 callers (exceto `loadDefaultFixture` que também é órfão) |
| `server/src/db/fixtures/loader.ts:111-118` `loadDefaultFixture` | 0 callers |
| `server/src/db/fixtures/index.ts:16` exports dos órfãos | Barrel cleanup |
| `server/src/db/fixtures/registry-shots.ts:102-114` `snapshotRegistryJSON`, `parseRegistryShot` | Idem |

### 🟡 CAUTELA (remover requer migrar callers)

| Item | Risco | Mitigação |
|---|---|---|
| `VITE_MOCK` (legacy fallback) | Quebraria `vite.config.ts:26` se removido | Substituir lógica de detecção por apenas `__USE_MOCK__` |
| `VITE_MOCK_MODE` | Idem | Idem |
| `__USE_MOCK__` flag de .env | É **necessário** para gate em `main.tsx:7` e tests | **MANTER** |
| `src/mocks/scenarios/types.ts` | Se remover scenarios, remover este também | Manter — é a base de 7 cenários ativos |
| `src/mocks/toggle.ts` | É runtime dev-only (PC) | Manter — `window.__MSW_SCENARIO` é feature de QA manual |
| Cenários (7) | Cada cenário tem consumers em handlers e tests | Manter — 24+ tests usam |

### 🔴 PERIGOSO remover (quebraria testes)

| Item | Impacto |
|---|---|
| `src/test/setup.ts` | 297 testes falham no setup (no MSW server) |
| `src/mocks/server.ts` | Vitest não consegue interceptar fetch |
| `src/mocks/handlers/*` (qualquer um) | Tests daquele domínio falham (24+ tests) |
| `src/mocks/fixtures/*` (qualquer um) | Handlers que os importam quebram |
| `public/mockServiceWorker.js` | PC dev e tests com `onUnhandledRequest: 'error'` quebram |
| `server/src/db/fixtures/{loader,serializer,registry-shots}.ts` | 2 server tests falham |
| `src/main.tsx:7-9` gate MSW | PC dev perde MSW (mas tem backend real, então não quebra funcionalmente) |
| `server/src/db/fixtures/index.ts` barrel | Qualquer importador que use o barrel quebra |

---

## 4. Plano de eliminação faseado (zero-break)

### Fase A — Limpar flags mortas (1 commit, sem risco)

**Objetivo**: remover 3 env vars + 2 flags define + 1 provider file + entries em vite/vitest configs.

```diff
# .env
- VITE_MOCK_RESTAURANTS=true
- VITE_MOCK_ORDERS=true
- VITE_MOCK_GEOCODING=true
```

```diff
# vite.config.ts
- const mockRestaurants = mockFlag || env['VITE_MOCK_RESTAURANTS'] === 'true'
- const mockOrders = mockFlag || env['VITE_MOCK_ORDERS'] === 'true'
+ const mockFlag = env['VITE_MOCK'] === 'true'  // único gate
- VITE_MOCK_RESTAURANTS: env['VITE_MOCK_RESTAURANTS'],
- VITE_MOCK_ORDERS: env['VITE_MOCK_ORDERS'],
- __MOCK_RESTAURANTS__: JSON.stringify(mockRestaurants),
- __MOCK_ORDERS__: JSON.stringify(mockOrders),
```

```diff
# vitest.config.ts
- function getMockRestaurantsFlag() { ... }
- function getMockOrdersFlag() { ... }
- __MOCK_RESTAURANTS__: getMockRestaurantsFlag(),
- __MOCK_ORDERS__: getMockOrdersFlag(),
```

```diff
# src/vite-env.d.ts
- declare const __MOCK_RESTAURANTS__: boolean;
- declare const __MOCK_ORDERS__: boolean;
```

```diff
# src/providers/flags.ts — DELETE inteiro (0 callers)
```

```diff
# src/pages/dev/FlagsDebug.tsx — remover entradas mortas (line 5-6)
```

**Validação**: `npm run lint && npx tsc -b && npx vitest run && npm run build` deve passar (provado: nenhuma flag morta tem caller).

### Fase B — Limpar exports órfãos em server fixtures (1 commit)

**Objetivo**: remover funções em `server/src/db/fixtures/loader.ts` e `registry-shots.ts` que ninguém chama.

```diff
# server/src/db/fixtures/loader.ts
- export async function readFixtureFile(...) { ... }
- export async function writeSnapshotFile(...) { ... }
- export async function loadDefaultFixture(...) { ... }
```

```diff
# server/src/db/fixtures/registry-shots.ts
- export function snapshotRegistryJSON(...)
- export function parseRegistryShot(...)
```

```diff
# server/src/db/fixtures/index.ts
- export { readFixtureFile, writeSnapshotFile, loadFixture, loadDefaultFixture } from './loader';
+ export { loadFixture } from './loader';
+ export { snapshotRegistry, restoreRegistry } from './registry-shots';
+ export type { RegistryShot, RepoSnapshot } from './registry-shots';
```

**Validação**: rodar `npx vitest run` (inclui `load-fixture.test.ts` e `serializer.test.ts` que não usam os órfãos — verificado). Checar `npx tsc -b` para confirmar que `__tests__/contract/endpoint-parity.test.ts` (que importa `mockGlobalCoupons` de outro lugar, não dos fixtures) não depende.

### Fase C — Atualizar documentação (1 commit, sem risco)

**Objetivo**: corrigir drift detectado no Obsidian.

- `MSW — Mock Service Worker.md`: atualizar para refletir `onUnhandledRequest: 'error'` (era `'bypass'`), remover referência a `scenarioContext.ts` inexistente, adicionar nota sobre ADR-004 (backend como single source of truth em dev runtime, MSW é test-only + dev PC).
- `Testes - MSW Handlers e Cenários.md`: consertar encoding do filename + verificar conteúdo.

### Fase D — Avaliar (NÃO executar) se MSW deve sair do dev runtime

**Premissa**: com ADR-004, MSW no PC é redundante (backend serve os mesmos dados). Poderia ser removido de `main.tsx:7-9`.

**Mas**:
- ❌ Quebra QA manual de cenários (`window.__MSW_SCENARIO = "kitchen_congested"`) que ainda é documentado
- ❌ Tests que dependem de `__USE_MOCK__` para o setup de cenários precisariam reescrita
- ❌ Mocks de `superadmin`, `merchant`, `courier`, `tenant` ainda não têm endpoints backend implementados

**Recomendação**: **NÃO executar**. Manter MSW em dev (PC) como preview de features ainda não backend-izadas, e como infraestrutura de tests.

---

## 5. Resumo executivo

| Métrica | Antes | Depois (Fase A + B) |
|---|---|---|
| Arquivos deletados | — | 1 (`providers/flags.ts`) |
| Funções removidas | — | 5 (`loadDefaultFixture`, `readFixtureFile`, `writeSnapshotFile`, `snapshotRegistryJSON`, `parseRegistryShot`) |
| Flags/vars removidas | — | 5 (`VITE_MOCK_GEOCODING`, `VITE_MOCK_ORDERS`, `VITE_MOCK_RESTAURANTS`, `__MOCK_ORDERS__`, `__MOCK_RESTAURANTS__`) |
| LOC removidos | — | ~80 (loader.ts, flags.ts, dead defines) |
| Tests quebrados | — | **0** |
| Build impact | — | **0** |
| Risco arquitetural | — | **0** — só remove código morto |

**Recomendação**: executar Fase A → B → C. Pular Fase D (manter MSW em dev PC).

---

## Execução (2026-06-06)

**Fase A — Limpar flags mortas** ✅
- `.env`: removidas `VITE_MOCK_RESTAURANTS`, `VITE_MOCK_ORDERS`, `VITE_MOCK_GEOCODING`
- `vite.config.ts`: removidos defines `__MOCK_RESTAURANTS__`, `__MOCK_ORDERS__`; função `mockRestaurants`/`mockOrders` removidas; `console.log` simplificado
- `vitest.config.ts`: removidas funções `getMockRestaurantsFlag`/`getMockOrdersFlag` e defines correspondentes
- `src/vite-env.d.ts`: removidas declarations `__MOCK_RESTAURANTS__`, `__MOCK_ORDERS__`
- `src/providers/flags.ts`: reescrito com `isMockRestaurants()` e `isMockOrders()` retornando `false` hardcoded (gate do `getRestaurantProvider()`/`getOrderProvider()` mantidos intactos)
- `src/pages/dev/FlagsDebug.tsx`: removidas entradas `__MOCK_RESTAURANTS__` e `__MOCK_ORDERS__`

**Fase B — Remover órfãos de server fixtures** ✅
- `server/src/db/fixtures/loader.ts`: removidas `readFixtureFile`, `writeSnapshotFile`, `loadDefaultFixture`; imports de `fs`/`path`/`RegistryShot`/`snapshotRegistryJSON` removidos
- `server/src/db/fixtures/registry-shots.ts`: removidas `snapshotRegistryJSON`, `parseRegistryShot`
- `server/src/db/fixtures/index.ts`: barrel re-export simplificado

**Fase C — Atualizar docs** ✅
- `docs/obsidian/knowledge/MSW - Mock Service Worker.md`: drift corrigido (`onUnhandledRequest: 'bypass'` → `'error'`); referência a `scenarioContext.ts` inexistente removida; adicionada nota sobre ADR-004 e runtime dev
- `docs/obsidian/knowledge/Testes - MSW Handlers e Cenários.md`: encoding corrigido (era CP1252 com `��`); drift corrigido; adicionada seção "Fase 30 - Cleanup"

**Validação Final**:

| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ 0 erros |
| `npx tsc -b` | ✅ exit 0 |
| `npx vitest run` | ✅ 297/297 (28 files, 169.99s) |
| `npm run build` | ✅ built in 40.52s |

**Métricas da execução**:

| Métrica | Antes | Depois |
|---|---|---|
| Env vars mock | 5 (`VITE_MOCK`, `VITE_MOCK_MODE`, `VITE_MOCK_RESTAURANTS`, `VITE_MOCK_ORDERS`, `VITE_MOCK_GEOCODING`) | 2 (`VITE_MOCK`, `VITE_MOCK_MODE`) |
| Defines Vite | 4 (`__USE_MOCK__`, `__MOCK_RESTAURANTS__`, `__MOCK_ORDERS__`, `__DB_PROVIDER__`) | 2 (`__USE_MOCK__`, `__DB_PROVIDER__`) |
| Funções em `server/src/db/fixtures/loader.ts` | 4 (loader, read, write, loadDefault) | 1 (loader) |
| Funções em `server/src/db/fixtures/registry-shots.ts` | 4 (snapshot, restore, snapshotJSON, parseShot) | 2 (snapshot, restore) |
| Testes quebrados | — | **0** |
| LOC removidos | — | **~120** (loader.ts, registry-shots.ts, defines, env vars) |

## Decisão final

✅ MSW permanece em dev PC (Fase D pulada) por:
- Cenários de QA manual via `window.__MSW_SCENARIO`
- Endpoints ainda não backend-izados (superadmin, merchant, courier, tenant)
- Testes de cenários (24 tests) dependem da infra de scenarios

✅ `isMockRestaurants()`/`isMockOrders()` mantidos (gate do provider layer paralelo) — atualmente sempre `false`, mas a infra do `MockRestaurantProvider` e `HttpRestaurantProvider` permanece como **escape hatch** caso futuro precise alternar entre fontes de dados sem refactor.
