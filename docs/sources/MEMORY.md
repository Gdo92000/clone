---
title: Session Memory — Flux Delivery
updated: 2026-05-22T21:37:00-03:00
---

# 🧠 Session Memory — Flux Delivery

> Para uso em **outro chat**. Tudo que um novo agente precisa para continuar o trabalho sem perder contexto.

---

## 1. O que é o projeto

**Flux Delivery** — SaaS de delivery multi-perfil (Client, Merchant, Admin, Superadmin, Courier, Enterprise).

| Item | Valor |
|------|-------|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS 4 + React Router 7 + TanStack Query 5 |
| **Backend** | Hono 4 + `@hono/node-server` + Drizzle ORM 0.45 + Zod 4 |
| **DB** | PostgreSQL (Supabase) |
| **Auth** | JWT HS256 (`@hono/jwt`) + bcryptjs + refresh tokens |
| **Testes** | Vitest (dual-project: frontend jsdom / server node) + MSW v2 |
| **Local packages** | `packages/tokens/` (@fluxds/tokens), `packages/ui/` (@fluxds/ui) |

---

## 2. Último commit

```
436ebd7 feat: FASE 19-23 enterprise infrastructure implementation
```

Data: `2026-05-22T21:33:00-03:00` — 13 arquivos criados, 1699 linhas.

---

## 3. Status de validação (última execução: 2026-05-22)

| Gate | Status |
|------|--------|
| `tsc --noEmit` | ✅ 0 erros |
| `tsc -b --noEmit` | ✅ 0 erros |
| `vitest run` | ✅ 211 testes (15 suítes) |
| `vite build` | ✅ limpo |
| `eslint src/lib/storage` | ✅ 0 erros |
| `eslint src` (prod, excluindo testes) | ⚠️ 1 warn pre-existente (`OnlineStatusProvider.tsx` react-refresh) |

---

## 4. Arquitetura de camadas (L1–L6)

```
L1 frontend (React, componentes)
  ↓ imports
L2 API layer (src/api/ — httpClient NÃO exportado para componentes)
  ↓ chamadas
L3 Repositórios (src/repositories/)
  ↓
L4 Casca de validação (DTOs + Zod)
  ↓
L5 Serviços de domínio (retorno de lógica ppal no L6)
  ↓
L6 Rotas Hono (server/src/routes/)
```

- `DATABASE_PROVIDER=postgres` → repositórios Postgres (Drizzle)
- `DATABASE_PROVIDER=memory` → repositórios em memória determinísticos
- Proibido importar `httpClient` diretamente de componentes/hooks
- Proibido cross-layer imports (frontend → serviço, etc.)

---

## 5. Fases concluídas

### ✅ FASE 15 — Memory Repository

| Arquivo | Conteúdo |
|---------|----------|
| `server/src/db/repositories/base-memory.ts` | `BaseMemoryRepository` + `EntityStore` + ID determinístico (LCG+DJB2) + `getNow()` |
| `server/src/db/repositories/memory/memory-restaurants.ts` | `MemoryRestaurantRepository` com filtro Haversine |
| `server/src/db/repositories/memory/memory-coverage-cities.ts` | `MemoryCoverageCityRepository` |
| `server/src/db/registry-memory.ts` | `createMemoryRegistry()` + `clearAllMemoryStores()` |
| `server/src/db/index.ts` | **reescrito** — `createDatabase()`, Proxy, `getOrCreateDatabase()` |
| `server/src/config.ts` | DATABASE_PROVIDER=**postgres** padrão |

### ✅ FASE 16 — Contract Schemas (Zod Shared)

| Arquivo | Schema |
|---------|--------|
| `shared/validations/coverageCity.ts` | Cidades de cobertura |
| `shared/validations/plan.ts` | Planos |
| `shared/validations/globalCoupon.ts` | Cupons globais |
| `server/src/__tests__/contract/endpoint-parity.test.ts` | 23 testes ✅ |

### ✅ FASE 17 — Environment Runtime

| Arquivo | Conteúdo |
|---------|----------|
| `server/src/lib/environmentRuntime.ts` | `initRuntime(env)` + `shutdownRuntime()` + `isMemoryMode()` |
| `server/src/telemetry/router.ts` | Stub telemetry (postgres: real; memory: no-op) |
| `server/src/replay/recorder.ts` | Stub replay (postgres: no-op; memory: grava requisições) |
| `server/src/chaos/router.ts` | Stub chaos (postgres: no-op; memory: ativo) |
| `server/src/routes/health.runtime.ts` | `/healthz`, `/livez`, `/readyz` |

Auto-bootstrap por capability:
```ts
if (capabilities.hasReplay)  await startReplayRecorder()
if (capabilities.hasChaos)   initChaosRouter()
if (capabilities.hasTelemetry) initTelemetry()
```

Registry global guardado em `globalThis.__flux_registry__`.

### ✅ FASE 18 — Snapshot Fixtures

| Arquivo | Conteúdo |
|---------|----------|
| `server/src/db/fixtures/serializer.ts` | `serializeEntity / serializeEntities / assertSerializable` |
| `server/src/db/fixtures/registry-shots.ts` | `snapshotRegistry / restoreRegistry` (JSON de/serializer) |
| `server/src/db/fixtures/loader.ts` | `loadFixture / readFixtureFile / writeSnapshotFile` |
| `server/src/__tests__/fixtures/` | 18 testes ✅ |

### ✅ FASE 19 — Telemetry

| Arquivo | Conteúdo |
|---------|----------|
| `server/src/telemetry/index.ts` | Barrel export |
| `server/src/telemetry/router.ts` | Telemetria real: `startTelemetry()` + `initTelemetry()` + event emitter |
| `router.test.ts` | 18 testes ✅ |

`environmentRuntime.ts` usa `startTelemetry()` (alias, não `initTelemetry`). Barrel expandido.

### ✅ FASE 20 — Replay Recorder

| Arquivo | Conteúdo |
|---------|----------|
| `server/src/replay/index.ts` | Barrel |
| `server/src/replay/recorder.ts` | Gravação de requisições HTTP (`RequestEntry`) por namespace |
| `recorder.test.ts` | 21 testes ✅ |

`startReplayRecorder()` cai para `globalThis.__flux_capabilities__` — evita ciclo com `telemetry → requestContext → provider-selector`.
`initRuntime()` captura recording com uma única chamada.

### ✅ FASE 21 — Chaos Router

| Arquivo | Conteúdo |
|---------|----------|
| `server/src/chaos/router.ts` | `ChaosScenario`, `updateChaosScenarios()`, `getActiveChaosScenarios()` |

Cenários: `latencyMs`, `errorRate`, `simulateTimeout`. Apenas em modo memory.

### ✅ FASE 22 — Resilience (Retry + Saga)

| Arquivo | Conteúdo |
|---------|----------|
| `server/src/lib/resilience/index.ts` | `delay()`, `isTransientError()`, `retry()`, `CircuitBreaker`, `runSaga()`, `runStep()` |

- `isTransientError()` — PG 57xxx/08xxx + Node net codes (ECONNRESET, ETIMEDOUT, etc.)
- `retry()` — exponential backoff + jitter
- `CircuitBreaker` — CLOSED → HALF_OPEN → OPEN
- `runSaga()` — compensator rollback com `runStep()`

### ✅ FASE 22b — City-Guard Hardening

- `useLiveCityEstablishments` usa `isSameCityName()` do `cityCoverageService` em todo lugar
- `ProtectionStatus` ganha `isCityRegistered: boolean`
- `server/src/db/memory-restaurants.ts` tem mirror de `isSameCityName + normalizeCityName`

### ✅ FASE 23 — IndexedDB Offline Storage

| Arquivo | Conteúdo |
|---------|----------|
| `src/lib/storage/index.ts` | IndexedDB wrapper + mutation queue + `ReconnectSync` |

APIs: `setItem / getItem / removeItem / clearStore / getAllFromStore / enqueueMutation / dequeueAll / getQueueLength / closeStore`
`ReconnectSync` singleton: `onConnect() / onDisconnect() / onSync() / clearSyncData() / getReconnectSync()`
Stores: `mutation_queue` (id+synced), `cached_establishments`, `cached_cities`.

---

## 6. Feature pendente — Proximidade (contexto.txt)

**Requisito** (de `docs/sources/contexto.txt`):

> Funcionalidade de busca de estabelecimentos por proximidade, que:
> 1. Funcione **desktop + mobile**
> 2. Use **Geolocation API real** + **Nominatim reverse-geocode** (OpenStreetMap, sem API key)
> 3. Tenha **duas camadas de proteção por cidade**:
>    - Camada 1: cidade detectada ∈ cidades registadas no banco? → sim → buscar
>    - Camada 2: cidade ∉ cidades registadas → bloquear, mostrar "Cidade não atendida"
> 4. Mostre **apenas estabelecimentos próximos ao usuário**
> 5. Funcione de verdade (não mock)

### Arquivos relacionados já existentes

| Arquivo | Função |
|---------|--------|
| `src/hooks/useLiveCityEstablishments.ts` | Hook orquestrador — Geolocation + Nominatim + `findRegisteredCityCoverage` + Haversine |
| `src/services/locationService.ts` | Geolocation API + Nominatim reverse-geocode + Haversine |
| `src/services/cityCoverageService.ts` | `findRegisteredCityCoverage()` — single truth cidades registadas |
| `src/context/LocationContext.tsx` | Estado compartilhado de cidade/coordenadas |
| `shared/validations/coverageCity.ts` | Schema Zod cidades |
| `server/src/services/coverageCityService.ts` | Backend: busca cidades no registry |
| `server/src/db/repositories/memory/memory-coverage-cities.ts` | Repositório memória cidades |
| `src/pages/CityRestaurantsPage.tsx` | Página de busca por proximidade |
| `docs/obsidian/📍 Proximidade e Geocodificação.md` | Docs de proximidade |

### O que já funciona (CityRestaurantsPage + useLiveCityEstablishments)

- Geolocation.getCurrentPosition() → coords do usuário
- Nominatim reverse-geocode → cidade detectada
- `findRegisteredCityCoverage(city)` → valida se cidade está cadastrada
- Haversine → filtra restaurantes por raio configurável (2/5/8/12 km)
- `ProtectionStatus.canSearch` + `reason` → mensagem de erro se cidade não atendida
- Botões "Usar GPS" e "Atualizar localização" na página
- Responsivo desktop/mobile
- Sem API key paga, sem mock de proximidade

### O que falta (próximos passos)

1. Testar fluxo real com Geolocation + Nominatim em browser
2. Verificar se `GET /api/coverage-cities` está populado na base Postgres
3. Validar: cidade atendida = mostra restaurantes; cidade NÃO atendida = bloqueia
4. Potencialmente adicionar cache de geocodificação no IndexedDB (evitar repetidas chamadas a Nominatim)

---

## 7. Configuração do ambiente

```
DATABASE_URL=postgresql://...      # obrigatório em postgres mode
DATABASE_PROVIDER=memory           # para desenvolvimento sem DB
JWT_SECRET=...
CORS_ORIGINS=http://localhost:5173,...
```

---

## 8. Comandos principais

```bash
npm install              # dependências
npm run dev              # client + server concurrently
npm run dev:client       # frontend only (port 5173)
npm run dev:server       # backend only (port 3001)
npm run build            # tsc -b && vite build
npm run lint             # ESLint
npm run test:run         # vitest single-pass
npm run test:coverage    # com coverage v8
npm run db:generate      # drizzle-kit generate
npm run db:migrate       # drizzle-kit migrate
npm run db:studio        # drizzle-kit studio
```

---

## 9. Aliases de path

```
@/components/*   → src/components/*
@/hooks/*        → src/hooks/*
@/api/*          → src/api/*
@/storage/*      → src/storage/*
@/services/*     → src/services/*
@/repositories/* → src/repositories/*
@/modules/*      → src/modules/*
```

---

## 10. Regras arquiteturais (lembretes)

- Zero `any`, zero casts, zero `@ts-ignore`
- Zero mocks falsos em produção
- Nenhum removed code comentado
- Toda entrada HTTP valida com Zod (schemas em `shared/validations/`)
- DTOs separados de entidades DB
- Mutations offline → fila IndexedDB → `ReconnectSync.onConnect` → dequeue + reenvio
- Health endpoints: `/healthz`, `/livez`, `/readyz`

---

## 11. Próximas fases planejadas

| Fase | Nome | Status |
|------|------|--------|
| ✅ 15 | Memory Repository | Concluída |
| ✅ 16 | Contract Schemas | Concluída |
| ✅ 17 | Environment Runtime | Concluída |
| ✅ 18 | Snapshot Fixtures | Concluída |
| ✅ 19 | Telemetry real | Concluída |
| ✅ 20 | Replay Recorder | Concluída |
| ✅ 21 | Chaos Router | Concluída |
| ✅ 22 | Retry + Saga + CircuitBreaker | Concluída |
| ✅ 22b | City-Guard hardening | Concluída |
| ✅ 23 | IndexedDB Offline Storage | Concluída |
| ⬜ 24+ | Restante do plano | Pendente |

---

> **Última atualização**: 2026-05-22T21:37:00-03:00  
> **Branch**: `main` @ `436ebd7`
