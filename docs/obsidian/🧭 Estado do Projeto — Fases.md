# 🧭 Estado do Projeto — Índice das Fases

> **Projeto**: Flux Delivery — Enterprise Delivery SaaS  
> **Branch principal**: `main`  
> **Última atualização**: 2026-05-22  
> **Responsável**: Kilo (AI Engineering Agent)

---

## ✅ FASE 15 — Memory Repository

### Objetivo
Implementar repositórios em memória 100% determinísticos que permitem rodar todo o backend sem banco de dados.

### Arquivos criados

| Arquivo | Linhas |
|---|---|
| `server/src/db/repositories/base-memory.ts` | 274 |
| `server/src/db/repositories/memory/memory-restaurants.ts` | `memoryRestaurants.ts` |
| `server/src/db/repositories/memory/memory-coverage-cities.ts` | `memoryCoverageCities.ts` |
| `server/src/db/registry-memory.ts` | 119 |

### Decisões chave

- **IDs determinísticos via `deterministicId(namespace, name)`** — que usa LCG (Linear Congruential Generator) + hash DJB2
- **Timestamps controlados** via `getNow()` + `setClock(offsetMs)` para testes determinísticos
- **EntityStore por namespace** — isolamento total entre entidades
- **tenantFilter()** injeta `tenantId` no filtro/especificação de busca
- **snapshot() / restore()** built-in em cada repositório
- **Proxy DB em modo memory** retorna `undefined` em qualquer acesso — detectável em testes

### Testes
- `clearAllMemoryStores()` usado como afterEach
- Singleton `_memoryRegistry` na factory evita recriação entre módulos

---

## ✅ FASE 16 — Contract Schemas (Zod / Shared Validations)

### Objetivo
Single source of truth para payloads de API, compartilhados entre backend e MSW (frontend mocks).

### Schemas criados

| Schema | Arquivo |
|---|---|
| coverageCity | `shared/validations/coverageCity.ts` |
| plan | `shared/validations/plan.ts` |
| globalCoupon | `shared/validations/globalCoupon.ts` |

### Testes (`endpoint-parity.test.ts`) — 23 testes ✅

| Grupo | Testes |
|---|---|
| Coverage cities | schema validate, required fields, radius_km ranges, coords numéricas |
| Global coupons | schema validate, discount_type enum, nullable description |
| Plans | schema validate, nullable max_* campos, monthly_price como string |
| Endpoint codes | GET / 200, 404 handling, DELETE 200, error payload consistency |
| Drift detection | fixture keys ⊆ schema keys, required fields presentes |

---

## ✅ FASE 17 — Environment Runtime

### Objetivo
Auto-bootstrap completo do backend com uma única chamada `initRuntime(env)`.

### Arquivos criados

| Arquivo | Descrição |
|---|---|
| `server/src/lib/environmentRuntime.ts` | initRuntime() + shutdownRuntime() + isMemoryMode() |
| `server/src/telemetry/router.ts` | Stub init/shutdown telemetry (no-op) |
| `server/src/replay/recorder.ts` | Stub start/stop Replay recorder (no-op) |
| `server/src/chaos/router.ts` | Stub init Chaos router (no-op) |
| `server/src/routes/health.runtime.ts` | /healthz, /livez, /readyz |

### Auto-bootstrap por capability

```typescript
if (capabilities.hasReplay)    await startReplayRecorder()
if (capabilities.hasChaos)     initChaosRouter()
if (capabilities.hasTelemetry) initTelemetry()
```

### Registry global
`__flux_registry__` guardado em `globalThis` para acesso cross-module sem import cycles.

---

## ✅ FASE 18 — Snapshot Fixtures

### Objetivo
Arquitetura de fixtures determinísticas: serializador de entidades, snapshots de registry memória e loader de fixtures JSON.

### Arquivos criados

| Arquivo | Linhas |
|---|---|
| `server/src/db/fixtures/serializer.ts` | serializeEntity / serializeEntities / assertSerializable |
| `server/src/db/fixtures/registry-shots.ts` | snapshotRegistry / restoreRegistry / JSON (de)serializador |
| `server/src/db/fixtures/loader.ts` | loadFixture / readFixtureFile / writeSnapshotFile |
| `server/src/db/fixtures/index.ts` | barrel export |
| `server/src/__tests__/fixtures/serializer.test.ts` | 12 testes ✅ |
| `server/src/__tests__/fixtures/load-fixture.test.ts` | 6 testes ✅ |

### Decisões
- **`deepStripFunctions`** com `WeakSet<object>` para detectar referências circulares sem stack overflow
- **`serializeEntity`** retorna `Record<string, unknown>` — lida com Date, BigInt, NaN, Infinity, funções, símbolos
- **`assertSerializable`** aplica deep-strip antes de `JSON.stringify`; detecta também objetos circulares não compatíveis
- **`snapshotRegistry`** lê `snapshot()` de cada repo do `registry.repos` via duck-typing
- **`restoreRegistry`** usa chave de nome de repo (ex: `'coverageCities'`), não o índice da interface `Repositories`
- **`loadFixture`** suporta `clearBefore`, `strict` e modo não-strict

### Bug corrigido durante implementação
- `EntityStore` não era exportado de `base-memory.ts` → `TypeError: EntityStore is not a constructor` em `registry-memory.ts` — fix exportando classe `EntityStore` em `base-memory.ts:111`.
- `assertSerializable` usava `JSON.stringify(value)` diretamente; funções/Date eram omitidas silenciosamente pelo JSON.stringify instead de stripping — fix: aplicar `deepStripFunctions` antes de `JSON.stringify`.

### Testes — 18 testes ✅

| Suite | Testes |
|---|---|
| serializer | 12 (date, bigint, NaN, Infinity, symbols, functions, arrays) |
| load-fixture | 6 (load, postgres no-op, strict/non-strict, clearBefore, accumulate) |

---

## ⏳ Pendências

### Vitest routes.test — timeout intermitente
`routes.test` passa quando rodado em isolamento; timeout só ocorre no suite completo — provável race condition com outros testes que modificam global state. Não causa falha de `tsc` ou `vite build`. Pode ser resolvido isolando suítes em projetos separados no `vitest.config.ts` ou adicionando `--pool=forks` nas execuções de CI.

---

## ⏳ Próximas fases

| Fase | Nome | Status |
|---|---|---|
| ✅ 15 | Memory Repository | Concluída |
| ✅ 16 | Contract Schemas | Concluída |
| ✅ 17 | Environment Runtime | Concluída |
| ✅ 18 | Snapshot Fixtures | Concluída |
| | 19 | Telemetry real | ✅ Concluída |
| | 20 | Replay Recorder | ✅ Concluída |
| | 21 | Chaos Router | ✅ Concluída |
| | 22 | Retry + Saga + CircuitBreaker | ✅ Concluída |
| | 22b | City-Guard hardening | ✅ Concluída |
| | 23 | IndexedDB Offline Storage | ✅ Concluída |
| ⬜ | 24+ | Restante do plano | Pendente |

---

## Validação gates — FASE 23

```
tsc --noEmit           ✅  (zero erros)
tsc -b --noEmit        ✅  (zero erros)
vitest run             ✅  211 tests passing (15 suítes)
vite build             ✅  built in 15.22s
eslint                 ✅  0 erros em src/lib/storage (1 warn pré-existente em OnlineStatusProvider)
```

Commit: `436ebd7 feat: FASE 19-23 enterprise infrastructure implementation`

---

## ✅ Arquivos criados — referências cruzadas

### FASE 15 — Memory Repository

| Arquivo | Descrição |
|---|---|
| `server/src/db/repositories/base-memory.ts` | BaseMemoryRepository + EntityStore + ID determinístico + getNow |
| `server/src/db/repositories/memory/memory-restaurants.ts` | MemoryRestaurantRepository (filtro haversine) |
| `server/src/db/repositories/memory/memory-coverage-cities.ts` | MemoryCoverageCityRepository |
| `server/src/db/registry-memory.ts` | createMemoryRegistry + clearAllMemoryStores + resetMemoryStore |
| `server/src/db/index.ts` | **REESCRITO** — createDatabase + Proxy + getOrCreateDatabase + getRegistry |
| `server/src/config.ts` | **ATUALIZADO** — DATABASE_URL opcional em modo memory |
| `server/src/db/schema/index.ts` | **REESCRITO** — runtime `tables` object + interface `Tables` |

### FASE 16 — Contract Schemas

| Arquivo | Descrição |
|---|---|
| `shared/validations/coverageCity.ts` | Schema Zod cidades de cobertura |
| `shared/validations/plan.ts` | Schema Zod planos |
| `shared/validations/globalCoupon.ts` | Schema Zod cupons globais |
| `server/src/__tests__/contract/endpoint-parity.test.ts` | 23 testes de contrato e drift detection |
| `shared/validations/index.ts` | barrel export dos schemas |

### FASE 17 — Environment Runtime

| Arquivo | Descrição |
|---|---|
| `server/src/lib/environmentRuntime.ts` | initRuntime() + shutdownRuntime() + isMemoryMode() |
| `server/src/telemetry/router.ts` | Stub telemetry |
| `server/src/replay/recorder.ts` | Stub replay |
| `server/src/chaos/router.ts` | Stub chaos |
| `server/src/routes/health.runtime.ts` | /healthz /livez /readyz |

### FASE 18 — Snapshot Fixtures

| Arquivo | Descrição |
|---|---|
| `server/src/db/fixtures/serializer.ts` | serializeEntity / serializeEntities / assertSerializable |
| `server/src/db/fixtures/registry-shots.ts` | snapshotRegistry / restoreRegistry |
| `server/src/db/fixtures/loader.ts` | loadFixture / readFixtureFile / writeSnapshotFile |
| `server/src/db/fixtures/index.ts` | barrel export |
| `server/src/__tests__/fixtures/serializer.test.ts` | 12 testes de serializer |
| `server/src/__tests__/fixtures/load-fixture.test.ts` | 6 testes de loader |
| `server/src/db/repositories/base-memory.ts` | **EntityStore exportado** — fix decorrente FASE 18 |

### FASE 19 — Telemetry

| Arquivo | Descrição |
|---|---|
| `server/src/telemetry/index.ts` | Barrel export |
| `server/src/telemetry/router.ts` | Telemetria real — `withSpan`, `recordSpanMetric`, evento emitter |
| `server/src/telemetry/router.test.ts` | 18 testes ✅ |

### FASE 20 — Replay Recorder

| Arquivo | Descrição |
|---|---|
| `server/src/replay/index.ts` | Barrel |
| `server/src/replay/recorder.ts` | Gravação de requisições por namespace — fallback `globalThis.__flux_capabilities__` |
| `server/src/replay/recorder.test.ts` | 21 testes ✅ |

### FASE 21 — Chaos Router

| Arquivo | Descrição |
|---|---|
| `server/src/chaos/router.ts` | `ChaosScenario`, `getActiveChaosScenarios()`, `getEffectiveLatencyMs()`, `shouldFail()`, `shouldTimeout()`, `resetChaosScenarios()` |

### FASE 22 — Resilience

| Arquivo | Descrição |
|---|---|
| `server/src/lib/resilience/index.ts` | `delay()`, `isTransientError()` (PG+net), `retry()` backoff+jitter, `CircuitBreaker` (CLOSED↔HALF_OPEN↔OPEN), `runSaga()` com compensator rollback |

### FASE 22b — City-Guard Hardening

| Arquivo | Descrição |
|---|---|
| `src/hooks/useLiveCityEstablishments.ts` | usa `isSameCityName()` everywhere; `ProtectionStatus.isCityRegistered: boolean` |
| `server/src/db/repositories/memory/memory-restaurants.ts` | mirror `isSameCityName + normalizeCityName` |

### FASE 23 — IndexedDB Offline Storage

| Arquivo | Descrição |
|---|---|
| `src/lib/storage/index.ts` | IndexedDB wrapper — `setItem/getItem/removeItem/clearStore/getAllFromStore` + fila `enqueueMutation()` / `dequeueAll()` / `getQueueLength()` + `ReconnectSync` singleton |

### Notas Obsidian criadas nesta sessão

| Arquivo | Conteúdo |
|---|---|
| `docs/obsidian/📋 Visão Geral do Projeto.md` | Stack, comandos, estrutura de pastas |
| `docs/obsidian/🗄️ Arquitetura de Dados.md` | Postgres↔Memory, provider selector, capabilities |
| `docs/obsidian/📐 Repository Ports & Schemas.md` | RepositoryPort, PostgresRepo, BaseMemoryRepo, Zod |
| `docs/obsidian/📌 Arquitetura de Camadas.md` | L1–L6 |
| `docs/obsidian/🔧 Módulos Core do Backend.md` | Logger, CircuitBreaker, Tenant, Health, Runtime |
| `docs/obsidian/🛣️ Rotas da API.md` | Estrutura, padrão, healthz, SSE |
| `docs/obsidian/🎨 Frontend.md` | Router, Query, proximidade, geocodificação |
| `docs/obsidian/🧪 Testes.md` | Vitest dual-project, MSW, fixtures |
| `docs/obsidian/🏗️ Estrutura do Backend.md` | árvore de pastas complete |
| `docs/obsidian/📦 Packages Locais.md` | @fluxds/tokens e @fluxds/ui |
| `docs/obsidian/🔌 MSW.md` | Cenários, setup, como adicionar cenário |
| `docs/obsidian/📍 Proximidade e Geocodificação.md` | fluxo busca por cidade, duas camadas de proteção |
| `docs/obsidian/MEMORY.md` | Memória de sessão completa para outro chat |
| `docs/obsidian/🧭 Estado do Projeto — Fases.md` | Índice completo, status, prtóximos passos |
