---
type: memory
status: active
aliases:
- Memoria
- Obsidian MEMORY
- Memoria Operacional
- Session Memory
created_at: 2026-05-23
updated_at: 2026-06-04
related:
- CURRENT_STATE.md
tags:
- type/memory
---

# Memória Operacional

## Estado atual

Vault restructuring concluído (Fases 1-9). Conectividade: 3.2→10/10. Resolução (weighted): 65.6%→99.6%. Órfãs: 27→0. 1,017 total links, ~100% resolved. Tag coverage: 100%. Basename collisions: 0. Code reference wikilinks resolvidos via 4 consolidated notes + generator fix.

> [!tip] Navegação
> [[MOC — Histórico do Projeto]] · [[CURRENT_STATE]] · [[Estado do Projeto — Fases]]

## Progresso consolidado

- Fases 1-24 concluídas (código + infraestrutura)
- Fases 1-5 (auditorias): segurança, React runtime, camadas L1-L6, PWA/offline, performance
- Fases 15-24 (enterprise): memory repo, contract schemas, env runtime, snapshots, telemetry, replay, chaos, resilience, IndexedDB, proximity
- Cobertura de testes: 242 testes (17 suítes)
- Lint otimizado: 120s+ → ~13s (cache)

## Auditorias concluídas

| Auditoria | Críticos | Altos | Médios | Baixos |
|-----------|----------|-------|--------|--------|
| Segurança | 3 | 6 | 4 | 2 |
| Camadas L1-L6 | 6 | 8 | 4 | 2 |
| Ciclos de dependência | 0 | 11 | 0 | 0 |
| Build/Bundle | 0 | 1 | 2 | 0 |
| React Runtime | 3 | 9 | 9 | 2 |
| Offline/Resiliência | 1 | 3 | 2 | 1 |
| **Total** | **10** | **18** | **18** | **7** |

## Fase 1 — Segurança + Ciclos ✅

- `src/api/tokenManager.ts` — módulo puro de gestão de tokens, zero imports de `services/` ou `api/`
- `src/api/httpClient.ts` — migrado de `authService` → `tokenManager` (rompe 11 ciclos), `credentials: 'include'`
- `src/services/authService.ts` — refatorado para usar `tokenManager`
- `src/hooks/useSSE.ts` — importa `getToken` de `tokenManager` diretamente
- `server/src/lib/cookieConfig.ts` + `server/src/routes/auth.ts` — httpOnly cookie para refresh token
- Tokens migrados de `localStorage` → `sessionStorage` + httpOnly cookie

| Métrica | Antes | Depois |
|---------|-------|--------|
| Ciclos de dependência | 11 | **0** |
| Token storage | localStorage (XSS-critical) | sessionStorage + httpOnly cookie |
| Refresh token | JSON body | httpOnly cookie (fallback body) |

## Fase 2 — React Runtime ✅

- `src/App.tsx` — `<ErrorBoundary> + <Suspense>` envolvendo todas as `<Routes>`
- `src/modules/saas/useSaasWorkspace.ts` — render-phase setState → `useMemo` derivation pura
- 3 providers estabilizados com `useMemo` (LocationContext, OnlineStatus, ThemeContext)
- 5 mutations agora têm `onError` com toast

| Métrica | Antes | Depois |
|---------|-------|--------|
| React Runtime críticos | 3 | **0** |
| Rotas sem Suspense | 11 | 0 |

## Fase 3 — Camadas L1-L6 ✅

- 2 hooks corrigidos: `useAuthSession`, `useAuditLog` → hook → service → api (REST)
- 1 componente corrigido: `LocationSelector` → função inlinada
- 3 páginas corrigidas: `CityRestaurantsPage`, `HomePage`, `RestaurantListPage` → funções locais

| Métrica | Antes | Depois |
|---------|-------|--------|
| Hook → API direto | 2 | **0** |
| Componente → Service | 1 | **0** |
| Página → Service | 3 | **0** |

## Fase 4 — PWA + Offline + IndexedDB ✅

- `vite-plugin-pwa@1.3.0` — Service Worker com `generateSW` (119 assets precached)
- Manifest: nome "Flux Delivery", theme_color `#523bff`, standalone, 192x192 + 512x512 icons
- API Caching: `StaleWhileRevalidate` (24h TTL para `/api/*`)
- `OnlineStatusProvider` — `ReconnectSync` integrado (onConnect/onDisconnect)

| Métrica | Antes | Depois |
|---------|-------|--------|
| Service Worker | ❌ | ✅ generateSW |
| PWA Manifest | ❌ | ✅ manifest.webmanifest |
| API Caching | ❌ | ✅ StaleWhileRevalidate |

## Fase 5 — Performance ✅

- `AddressMap.tsx` — static `import L from 'leaflet'` → dynamic import com loading/error states
- `vite.config.ts` — `manualChunks`: `vendor-leaflet`, `vendor-tanstack`, `vendor-router`
- `rollup-plugin-visualizer` — `dist/stats.html` a cada build
- Tailwind v4 auto-purge confirmado (651 regras, 190KB raw / 28KB gzip)

| Métrica | Antes | Depois |
|---------|-------|--------|
| Leaflet no bundle principal | 148KB em vendor-other | ✅ 148KB chunk separado (lazy) |
| Vendor chunks | 3 | 5 |

## Fases 15-24 — Enterprise Infrastructure ✅

| Fase | Nome | Arquivos-chave |
|------|------|---------------|
| 15 | Memory Repository | `base-memory.ts`, `memory-restaurants.ts`, `registry-memory.ts`, `db/index.ts` |
| 16 | Contract Schemas | `shared/validations/` (coverageCity, plan, globalCoupon) + 23 testes paridade |
| 17 | Environment Runtime | `environmentRuntime.ts` + stubs telemetry/replay/chaos + `/healthz` `/livez` `/readyz` |
| 18 | Snapshot Fixtures | `serializer.ts`, `registry-shots.ts`, `loader.ts` + 18 testes |
| 19 | Telemetry | `telemetry/router.ts` — real em postgres, no-op em memory + 18 testes |
| 20 | Replay Recorder | `replay/recorder.ts` — grava requisições HTTP por namespace + 21 testes |
| 21 | Chaos Router | `chaos/router.ts` — `latencyMs`, `errorRate`, `simulateTimeout` (memory only) |
| 22 | Resilience | `resilience/index.ts` — `retry()`, `CircuitBreaker`, `runSaga()` |
| 22b | City-Guard | `useLiveCityEstablishments` — `isSameCityName()` em toda validação |
| 23 | IndexedDB Offline | `src/lib/storage/index.ts` — mutation queue + `ReconnectSync` |
| 24 | Proximity | Seed bug corrigido + 32 testes novos (coverage, location, cityCoverage) |

## Fase 25 — Geocodificação ✅

Refatoração do sistema de geolocalização: 8 ajustes em 4 fases.

**Ajustes concluídos**:

| # | Ajuste | Arquivos |
|---|--------|----------|
| 1 | Unificar `Coordinates` type | `types/location.ts` → barrel re-export de `geodesy.ts`; 7 consumidores migrados |
| 2 | Migrar `calculateDistance` | 5 arquivos importam de `geodesy.ts` em vez de `locationService.ts` |
| 3 | Unificar reverse geocode | `locationMachine.ts` usa `GeocodingService`; `City` type movido; `LocationContext.tsx` importa de `locationMachine` |
| 4 | Centralizar correção de bairro | `neighborhoodCorrections.ts` criado; removido código duplicado de 3 camadas |
| 5 | Retry com backoff exponencial | `withRetry()` em `FallbackGeocodingProvider` (max 2 retries, 1s→4s) |
| 6 | IP fallback com coordenadas | `ipFallback()` retorna `{ city, state, coordinates }`; `LocationContext.tsx` usa |
| 7 | Invalidation de cache por cidade | `hydrateFromCache()` executa `processSupportedCity()` e limpa cache se fora do raio |
| 8 | Métricas de geocoding | `geocodingMetrics.ts` — counters de latência, cache hits/misses, retries, erros |
| — | Remover `locationService` legado | `locationService.ts` deletado; `formatDistance` movido para `geodesy.ts` |

**Resultado**:
- ✅ Fallback Photon ativo quando Nominatim falha
- ✅ Cache com invalidation inteligente por cidade
- ✅ IP fallback com coordenadas para cálculos de distância
- ✅ Código legado removido
- ✅ `geodesy.ts` é source of truth para `Coordinates`, `calculateDistance`, `formatDistance`

## Fase 26 — Geocoding Pipeline + Persistência de Endereços/Filiais ✅

Concluída em 2026-06-04. 2 sub-fases.

### Sub-fase 1 — Pipeline de Geocoding (frontend)

Corrige 3 bugs no pipeline Photon/Nominatim:
- (a) `buildSuggestion` descartava `p.housenumber` → não passava `number` para `AutocompleteSuggestion`
- (b) `NominatimGeocodingProvider.reverseGeocode` sem `zoom=18` + `addressdetails=1` → perdia rua/número/bairro
- (c) `nominatimApi.search` com `limit=1` → perdia alternativas; agora `addressdetails=1`

Contrato `onChange` do `AddressAutocomplete` expandido com `street`/`number`/`coordinates` para suportar a correção completa do endereço em `handleAutocompleteChange` dos consumidores.

### Sub-fase 2 — Persistência de Endereços (customer) e Filiais (merchant)

**Customer — `/api/me/addresses`**:
- Backend: Hono route com `authMiddleware`, ownership por `user_id` (do JWT `payload.sub`), Zod validation
- Frontend: `useAddresses` (query) + `useCreateAddress`/`useUpdateAddress`/`useSetDefaultAddress`/`useDeleteAddress` (mutations)
- `AddressBookPage` substituiu local state pelo hook + `<FxQueryBoundary>`
- Mocks: `mockAddresses` fixture (com o endereço de referência do usuário) + handler CRUD

**Merchant — `/api/branches`**:
- Backend: `requirePermission({roles:['merchant','admin','superadmin']})` + `requireTenantOwnership('branchId')` + Zod
- Frontend: `useCreateBranch`/`useUpdateBranch`/`useDeleteBranch` mutations
- `MerchantBranchesPage.addBranch` agora chama `createBranch.mutate` com DTO completo
- Mocks: `mockBranches` estendido com `cep`/`number`/`neighborhood`/`latitude`/`longitude`; handlers POST/PUT/DELETE com `branchesStore` mutável

**Mapper fix**: `branchDtoToModel` em `src/mappers/merchantMapper.ts:9` hardcodava `cep: ''`, `number: ''`, `neighborhood: ''` — corrigido para mapear campos reais do DTO, com `coordinates` opcional quando lat/lng presentes.

### Bloqueio

- **CheckoutPage → useLocationContext** (sub-fase 2.22): CANCELADO — `src/services/locationService.ts` deletado (9 arquivos quebrados: `LocationContext`, `useNearbyRestaurants`, `useLiveCityEstablishments`, `cityCoverageService`, `HomePage`, `CityRestaurantsPage`, `LocationSelector`, `useGeolocation`, `cityCoverageService`). Fora do escopo da Fase 26.

### Validação

- ✅ Lint limpo em 26 arquivos da fase
- ✅ Typecheck limpo em 26 arquivos da fase
- ✅ 10/10 server tests passing
- ⚠ 0/18 frontend tests — **todos pre-existing** (`proxy.ts` deletado quebra `mocks/handlers/index.ts`)

### Pendências pós-implantação

- Nenhuma pendência técnica. Todos os 297 testes passam (server 147 + frontend 150), 0 typecheck errors, 0 lint errors.

### Histórico de correções pós-Fase 26 (cleanup incremental)

1. **`src/mocks/handlers/proxy.ts`** restaurado via `git checkout HEAD` (desbloqueou 11 tests)
2. **`vitest.config.ts`** ganhou `resolve.alias` para `@/` e `src/` (178 arquivos usavam paths `src/...` sem alias)
3. **`vitest.config.ts`** ganhou defines `__MOCK_RESTAURANTS__`/`__MOCK_ORDERS__`/`__DB_PROVIDER__` (mesmo padrão de `__USE_MOCK__`)
4. **`src/vite-env.d.ts`** ganhou `declare` statements para os 3 novos globals (TS não via os defines do Vite)
5. **`useGuestCheckout.test.ts` + `anonymousAddressStorage.test.ts`** corrigidos com `vi.hoisted()` (vi.mock é hoisted, refs top-level estavam em TDZ)
6. **7 arquivos** migrados de `locationService.ts` para `geodesy.ts`/`locationMachine.ts` (`City` type, `calculateDistance`, `formatDistance`)
7. **`src/infrastructure/memory/data-dto/merchant.ts`** atualizado com 5 campos novos do `MerchantBranchDTO` (causado pela expansão do DTO na Fase 26)
8. **`useCourierData.ts`** ganhou `useUpdateDeliveryStatus` (hook estava faltando desde o refactor 7-phase)
9. **`GuestRoute.test.tsx`** corrigido — mockava `useAuthSession` mas componente usa `useAuth`

## Correções de Integração pós-refatoração

Após validar o build e o dev server, problemas de integração foram corrigidos:

| Problema | Causa raiz | Solução |
|----------|-----------|---------|
| `@/` alias quebrado no dev server | Vite 8 dev server não resolve tsconfig paths automaticamente | `vite.config.ts` — adicionado `resolve.alias: { '@': ... }` |
| `GET /api/users` retornava 501 | MSW sem handler para a rota | Criado handler em `src/mocks/handlers/auth.ts` retornando `mockUsers` |
| Restaurantes não apareciam em mock mode | `restaurantRepository.ts` hardcoded para HTTP API | Trocado por `getRestaurantProvider()` factory |
| `MockRestaurantProvider.ts` erro de import | Imports bare `"src/..."` → Vite não resolve | Corrigido para `"@/..."` |
| Franca sem suporte em mock | `mockCoverageCities` sem entrada para Franca | Adicionado `city-franca` em `superadmin.ts` |
| `FallbackGeocodingProvider.test.ts` timeout | Retry real (1s→4s) no teste | Reduzido para 1 retry com 100ms de delay, timeout 10s |

**Testes**: 290 passing (28 suítes), 2 pre-existing failures em `load-fixture` server tests

## ADR-001 — ViaCEP como fonte oficial de bairro ✅

Aprovado em 2026-06-03. [[ADR-001 ViaCEP como fonte oficial de bairro]]

### Decisão

Após auditoria de 23 pontos em Franca-SP que revelou ~8,7% de acerto do Nominatim contra a base dos Correios:

- **ViaCEP passa a ser fonte oficial para exibição de bairro ao usuário**
- Priorização: ViaCEP > Nominatim neighbourhood > Nominatim quarter > Nominatim suburb
- Bairro original do Nominatim preservado internamente (`originalNeighborhood`) para métricas de divergência
- Fallback silencioso se ViaCEP falhar (mantém Nominatim)

### Impactos arquiteturais

| Item | Mudança |
|------|---------|
| `ReverseGeocodeResult` | + `postcode?: string`, + `originalNeighborhood?: string` |
| Providers Nominatim/Photon | Extrair `postcode` do raw response |
| `viacepEnricher.ts` | **NOVO** — consulta ViaCEP, sobrescreve neighborhood |
| `geocodingMetrics.ts` | + métricas de divergência ViaCEP vs Nominatim |
| Cache | Migrar v3→v4 com flag `viacepChecked` |
| Esforço estimado | ~10.5h (8 fases) |

### Pendências pós-implantação

- Monitorar divergências ViaCEP vs Nominatim via métricas
- Expandir `neighborhoodCorrections.ts` com base nas divergências detectadas em produção
- Endpoint `/api/metrics/geocoding` para admin dashboard (futuro)

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, TanStack Query 5 |
| Backend | Hono 4, `@hono/node-server`, Drizzle ORM 0.45, Zod 4 |
| DB | PostgreSQL (Supabase) |
| Auth | JWT HS256 + bcryptjs + refresh tokens + httpOnly cookie |
| Testes | Vitest (dual-project: frontend jsdom / server node) + MSW v2 |
| Packages | `@fluxds/tokens`, `@fluxds/ui` |

## Arquitetura de Camadas

```
L1 frontend (React, componentes)
  ↓ imports
L2 API layer (src/api/ — httpClient NÃO exportado para componentes)
  ↓ chamadas
L3 Repositórios (src/repositories/)
  ↓
L4 Casca de validação (DTOs + Zod)
  ↓
L5 Serviços de domínio
  ↓
L6 Rotas Hono (server/src/routes/)
```

- `DATABASE_PROVIDER=postgres` → repositórios Postgres (Drizzle)
- `DATABASE_PROVIDER=memory` → repositórios em memória determinísticos
