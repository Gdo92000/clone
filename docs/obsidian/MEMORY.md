---
type: memory
status: active
aliases:
- Memoria
- Obsidian MEMORY
- Memoria Operacional
- Session Memory
created_at: 2026-05-23
updated_at: 2026-06-08
related:
- CURRENT_STATE.md
tags:
- type/memory
---

# Memória Operacional

## Estado atual

Vault restructuring concluído (Fases 1-9). Conectividade: 3.2→10/10. Resolução (weighted): 65.6%→99.6%. Órfãs: 27→0. 1,017 total links, ~100% resolved. Tag coverage: 100%. Basename collisions: 0. Code reference wikilinks resolvidos via 4 consolidated notes + generator fix.

**Fase 33 — Finalizada e Validada 100%** (2026-06-08).

**Migração `0012_purple_ricochet.sql` aplicada** no banco PostgreSQL local (port 5433). Tabela `idempotency_keys` criada com schema correto (PK em `idempotency_key`, status processing/completed/failed, response_status/response_body nullable, índice `idx_idempotency_keys_expires`).

**Validação E2E** concluída em 3 camadas:
- **182 testes vitest (12 suites server)** — cobrem winner/loser/polling/steal/cleanup
- **376 testes vitest (32 suites full)** — ✅ 100% passando
- **8 cenários SQL direto no PostgreSQL** — INSERT mutex, PK violation, UPDATE processing→completed, UPDATE processing→failed, loser polling completed/failed, non-duplication em orders/merchant_orders (0 registros), PK constraint rejeita duplicata
- **Lint** ✅ 0 erros, **Typecheck** ✅, **Build** ✅

**Histórico**: Correções P0 aplicadas (transaction, fallback removal, validateMenuItems, Idempotency-Key), migração executada, E2E validado. Veredicto: **Produção Ready**. Ver [[ADR-005 Mirror Service Atomicidade e Integridade]].

> [!tip] Navegação
> [[MOC — Histórico do Projeto]] · [[CURRENT_STATE]] · [[Estado do Projeto — Fases]]

## Progresso consolidado

- Fases 1-24 concluídas (código + infraestrutura)
- Fases 1-5 (auditorias): segurança, React runtime, camadas L1-L6, PWA/offline, performance
- Fases 15-24 (enterprise): memory repo, contract schemas, env runtime, snapshots, telemetry, replay, chaos, resilience, IndexedDB, proximity
- **Fase 25** — Geocodificação (refatoração 8 ajustes)
- **Fase 26** — Pipeline de Geocoding + Persistência de Endereços/Filiais (2 sub-fases)
- **Fase 27** — Governança de Geocoding (Fase 0) + Auditoria de Franca
- **Fase 28** — Remoção de mockCoverageCities + Cobertura Geofencing-Ready
- **Fase 29** — Coordenadas reais (8 restaurants) + Bahia Lanches (rest-9) + loop fix + Franca fallback + ViaCEP address-lookup refinement + Mobile (cert LAN + navbar responsivo + overflow fix + cache stale invalidation)
- **Fase 29 cleanup** — 5 lints pré-existentes corrigidos (load-fixture, LocationSelector, OnlineStatusProvider split, locationMachine async→sync, LocationContext hydrate)
- **ADR-004** — DB Seed Franca como single source of truth em dev (resolve 0 restaurants no mobile por SW do MSW não registrar com cert não confiável)
- **Fase 30** — Mock Cleanup: removidas 3 env vars mortas (`VITE_MOCK_GEOCODING/ORDERS/RESTAURANTS`), 2 defines (`__MOCK_*`), 5 funções órfãs de server fixtures (`loadDefaultFixture`, `readFixtureFile`, `writeSnapshotFile`, `snapshotRegistryJSON`, `parseRegistryShot`); docs MSW corrigidas (drift `bypass`→`error`). 0 testes quebrados.
- **Fase 30 — Part 3** — Correção de 3 problemas de runtime: (1) `coerceNumeric` util + 3 mappers (NUMERIC Postgres→string→number no FE); (2) `normalizeStateBR` util + LocationContext tryIpFallback + locateCity stateCode (UF "São Paulo"→"SP" no caminho de geolocalização); (3) `CITY_TTL=0` em DEV (mitigação para localStorage per-origin entre localhost/LAN IP). +58 testes (16 mapper + 32 states + 10 format). 355/355 verde.
- **Fase 31 — Mobile First Correction (concluída 100%)** — Plano de 5 fases (25 action items) aprovado. Touch target universal 44×44px (WCAG/Material). **25/25 itens concluídos**: merchant routes restructure (1.1-1.2), CTA/bottom-nav overlap fix (1.3), backTo navigation (1.4), 4 inline modais refatorados com `<Modal>` (1.5), FxIconButton component (2.6), Button min-h 44px + active scale (2.7), checkbox/toggle touch areas 44px (2.8), filter chips em carousels (2.9), FxFilterChips touch (2.10), Profile active/focus (3.11), FxPaymentMethod active/focus (3.12), scroll-snap 5 carousels (3.13), 7 grids 2-col → 1-col mobile (4.14), label associations + inputMode (4.15-4.16), password toggle + search dismiss (4.17-4.18), FxBottomNavigation touch (4.19), 3 páginas faltantes AdminLogin/CourierLogin/AdminCoverage (5.20), hardcoded paths → ROUTES.* (5.21), loyalty integrado com nav (5.22), merchant nav completo com Printer/Zap (5.23), orphan cleanup (5.24), validação final (5.25). Typecheck + lint + build (2270 modules, 43.60s) + 355 Vitest tests + E2E smoke (Playwright MCP em 5+ rotas) todos OK. E2E runner (Playwright): 4/4 admin.spec.ts passando — `loginAsDevUser` helper consertado para setar ambos `fluxds-dev-active-user` + `fluxds-auth-user` via DEV_USERS map; assertions com `getByRole('heading')` em vez de `body.textContent` (evita match com CSS inline).
- **Fase 32 — Saneamento /merchant curto prazo (concluída 100%)** — Implementados os 6 itens do curto prazo do diagnóstico de /merchant: (1) remoção de `opening_time`/`closing_time` da UI de `MerchantSettingsPage`; (2) **recriação** de `MerchantLoyaltyRewardsPage` em `/merchant/loyalty` (rewards CRUD + loyalty settings) com nav item "Fidelidade" (Gift); (3) consolidação auto-print em `/merchant/kitchen-auto-print` (deletado `/merchant/printer` standalone, rota `MERCHANT_PRINTER` removida); (4) `FeatureRoute` reescrito com `<EmptyState>` (icon Lock + CTA `/support`); (5) `usePlanLimits('company-1')` → `usePlanLimits(currentUser?.companyId ?? '')` em Catalog/Team/Campaigns + filtro users por companyId em Team; (6) CTA "Falar com o suporte" em `/merchant/subscription`. Decisões: CTA `/support` (não `/superadmin/plans`) pois Maria `company_owner` não tem acesso superadmin; `branch_settings.opening_time/closing_time` órfão permanece no DTO/mocks (escopo só UI); `useSaveBranchSettings.loyaltySettings` tornado opcional; setState-in-effect refatorado para setState no body com guard `prevSyncBranch`. Validação: typecheck ✅, lint ✅ (0 erros nos 12 arquivos), build ✅ (2273 modules, 14.44s), Vitest ✅ 355/355 (99.90s), E2E smoke ✅ 10/10 admin+merchant (48.8s). 12 falhas E2E em login/search/checkout confirmadas como pré-existentes via `git stash` (mesma falha no baseline).
- **Fase 33 — Fluxo Completo Checkout→Tracking→Catalog + Auth + Idempotency-Key (FINALIZADA e VALIDADA)** — 6 sub-fases implementadas + correções P0 + migration aplicada + E2E comprovado. **Migração `0012_purple_ricochet.sql` aplicada no PostgreSQL 18 (localhost:5433)**. Tabela `idempotency_keys` ativa com schema final: PK `idempotency_key`, status `processing/completed/failed`, response_status/response_body nullable, índice `idx_idempotency_keys_expires`. **Validação E2E**: 8 cenários SQL confirmam INSERT mutex (winner), PK violation (loser), UPDATE processing→completed/failed, loser polling completed/failed, non-duplicação em orders(0)/merchant_orders(0), PK constraint rejeita duplicata. Veredicto final: **Produção Ready — 4/4 bloqueadores**. Ver [[ADR-005 Mirror Service Atomicidade e Integridade]].
- Cobertura de testes: **376 testes (32 suítes, 63.75s)**
- Lint: 0 erros, 0 warnings

## Fase 27 — Governança de Geocoding ✅

Concluída em 2026-06-05. Skill `geolocation-system-governance` carregada e auditada. **4 correções Fase 0 aplicadas**, **relatório técnico** da causa raiz do "home vazio em Franca" entregue, **ADR-002** criado.

### Fase 0 — Aderência mínima à skill (4 mudanças)

| # | Mudança | Arquivo | Seção/Proibição |
|---|---------|---------|-----------------|
| 1 | `extractIpGeo()` valida `status === 'success'`/`!data.error`/cidade+estado não-vazios; `safeField()` logging seguro | `src/services/geolocationService.ts:159-189` | Proibição #18 |
| 2 | Tipo `CoordSource`; `LocationState.coord_source` e `coord_confidence`; `calculateCoordConfidence(accuracyMeters)` | `src/providers/locationMachine.ts:11,23-34,44-50` | Seção 6.2 |
| 3 | `processSupportedCity` exige `coord_confidence ≥ 0.6` | `src/providers/locationMachine.ts:72-87` | Seção 12.2.3 |
| 4 | Proveniência setada em 4 caminhos: `cache`/`ip_fallback`(0.20)/`gps`/`gps-fallback`(0.30)/`manual`(1.0) | `src/context/LocationContext.tsx:31-149` | Seção 6.2 |

### Auditoria de Franca-SP — Causa raiz diagnosticada

**Hipóteses validadas por grep** (B1–B6):
- B1: Cache 24h pode estar servindo SP/RJ/BH antigos (geolocationService.ts:6) ⚠ provável
- B2: IP detection falha → `city=null` ⚠ possível
- B3: **`mockCoverageCities` não tem Franca** (superadmin.ts:16-20 — apenas SP, RJ, BH) ✅ confirmado
- B4: `HomePage` filtra por `city.name` (NÃO consulta `isWithinSupportedCity`) ✅ confirmado
- B5/B6: `useLiveCityEstablishments` e `RestaurantListPage` exigem `isWithinSupportedCity` ✅ confirmado

**Diagnóstico final**: Franca é **estruturalmente vazia** no estado atual. **Correção (aplicada na Fase 28)**: whitelist `mockCoverageCities` removida; cobertura derivada de `restaurants.is_active`. Franca agora funciona via API real ou fallback em `cityCoverageFallback.ts`.

### Pendências da skill (adiadas, justificadas em ADR-002)

| Pendência | Status | Justificativa |
|-----------|--------|---------------|
| Proibição #3 (migrar `boolean` → `boolean \| null`) | ⏸ adiada | Quebraria 4 consumidores; ADR-002 |
| Proibição #9 (renomear `IpApiResponse`) | ⏸ adiada | Cosmético |
| Proibição #11 (User-Agent Nominatim) | ✅ já existe | `NominatimGeocodingProvider` JÁ adiciona — confirmado |
| Seção 7.3 (timeout GPS 25s → 8s) | ⏸ adiada | Decisão UX |
| Seção 9 (cache L3-L5) | ⏸ adiada | L2 (localStorage) já existe |
| Fase 17 (migração `CanonicalLocation` v2) | ⏸ adiada | ~3-5 dias; ADR separado |

### Validação

- ✅ `npx tsc -b` exit 0
- ✅ `npm run lint` 0 errors (1 warning pré-existente)
- ✅ `npx vitest run` 321/321 (28 files, 90.85s)

## Fase 28 — Remoção de mockCoverageCities + Cobertura Geofencing-Ready ✅

Concluída em 2026-06-05. Pivô arquitetural: substituir whitelist estática por cobertura derivada de `restaurants.is_active`. ADR-003 aprovado.

### Schema (Fase 28.1)

`restaurants` получил 4 novos campos: `is_active:boolean`, `delivery_radius_km:integer`, `coverage_zone_type:enum(city|neighborhood|radius|polygon)`, `coverage_polygon:jsonb`. Migration `drizzle/0011_next_miss_america.sql` executada. DB alinhado via psql.

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `is_active` | boolean | true | Restaurant visível na cobertura |
| `delivery_radius_km` | integer | 8 | Raio de entrega em km |
| `coverage_zone_type` | enum | 'city' | Tipo de zona: city/neighborhood/radius/polygon |
| `coverage_polygon` | jsonb | null | Polígono GeoJSON para zona customizada |

### Endpoints Backend (Fase 28.2)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/api/cities/active` | Lista cidades com restaurants ativos |
| GET | `/api/neighborhoods/active?city&state` | Lista bairros ativos de uma cidade |
| GET | `/api/cities/has-coverage?city&state` | Verifica se cidade tem coverage |
| GET | `/api/neighborhoods/has-coverage?city&state&neighborhood` | Verifica se bairro tem coverage |
| PUT | `/api/restaurants/:id/availability` | Altera `is_active` (roles: superadmin\|admin\|company_owner\|branch_manager) |

### Hooks Frontend (Fase 28.3)

- `useActiveCities()`, `useActiveNeighborhoods()`, `useCityCoverage()`, `useNeighborhoodCoverage()` (staleTime 5min)
- `useToggleRestaurantAvailability()` mutation com invalidação de `restaurantKeys.all` e `citiesKeys.all`
- `AdminRestaurantsPage` com toggle `isActive` por restaurant
- Consumidores migrados: `useLiveCityEstablishments`, `useNearbyRestaurants`, `LocationSelector`

### Remoção de Dead Code (Fase 28.4)

**17 arquivos deletados**: `coverage-cities.ts` (rota), `coverageCityService.ts` (2×), `CoverageCityApiService.ts`, `coverage.ts` (schema), `coverageCity.ts` (validation), `useCoverageData.ts`, `useCoverageCities.ts`, `CoverageCity.ts` (entity), `cityCoverageService.test.ts`, `coverage-cities.ts` (data fixture), `coverage.ts` (mock handler), 4 fixtures com dados de coverage.

**10+ arquivos refatorados**: `LocationContext.tsx` (síncrono, `CityCoverageResult`), `useLiveCityEstablishments.ts` (useMemo em vez de useEffect), `restaurantRepository.ts` (filtra `isActive`), `ops/index.ts` (remove `coverageCities` export), `endpoint-parity.test.ts`, `routes.test.ts`, `handlers.test.ts`.

### Cobertura Final

| Check | Resultado |
|-------|-----------|
| `npx tsc -b` | ✅ exit 0 |
| `npm run lint` | ✅ 0 errors (1 warning pré-existente) |
| `npx vitest run` | ✅ 297/297 (28 files, 93.61s) — 24 testes removidos com coverage-cities |
| `npm run build` | ✅ built in 19.46s |

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

## Auditorias concluídas

| Auditoria | Críticos | Altos | Médios | Baixos |
|-----------|----------|-------|--------|--------|
| Segurança | 3 | 6 | 4 | 2 |
| Camadas L1-L6 | 6 | 8 | 4 | 2 |
| Ciclos de dependência | 0 | 11 | 0 | 0 |
| Build/Bundle | 0 | 1 | 2 | 0 |
| React Runtime | 3 | 9 | 9 | 2 |
| Offline/Resiliência | 1 | 3 | 2 | 1 |
| MirrorService (Fase 33) | 2 | 2 | 4 | 0 |
| **Total** | **12** | **20** | **22** | **7** |

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

## ADR-002 — Proveniência e Confidence de Coordenadas ✅

Aprovado em 2026-06-05. [[ADR-002 Proveniancia e Confidence de Coordenadas]]

### Decisão

- `LocationState` carrega `coord_source: CoordSource` e `coord_confidence: number`
- `CoordSource = 'gps' | 'gps-fallback' | 'ip_fallback' | 'manual' | 'cache' | 'reverse_geocode' | null`
- `calculateCoordConfidence(accuracyMeters)`: GPS ≤10m→0.95, 50m→0.80, 100m→0.70, >500m→0.30; IP→0.20; manual→1.0
- `processSupportedCity` exige `coord_confidence ≥ 0.6` (Seção 12.2.3)
- `isWithinSupportedCity: boolean` mantido (não migrado para `boolean | null`)

### Impactos

- 4 mudanças não-breaking
- 0 mudanças de comportamento visível (exceto que Franca com IP não passa mais como "suportada")
- Migração futura para `CanonicalLocation` v2 preservará esses campos

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

## Aprendizados da Auditoria MirrorService (2026-06-08)

### Lição 1: Sequential inserts NÃO são atômicos

O `mirrorService.createConsumerOrderWithMirror` usa 4 `db.insert()` sequenciais sem `db.transaction`. 6 de 7 cenários de falha produzem gravação parcial. A justificativa original ("lint issue com proxy chain") foi **inválida** — `server/src/routes/orders.ts:60-133` JÁ usa `db.transaction` com sucesso no mesmo codebase. O abandono de transações foi uma divergência prematura do padrão do projeto.

**Regra derivada**: toda operação que envolve 2+ inserts em tabelas diferentes DEVE usar `db.transaction`. Try/catch + cleanup manual é paliativo (cleanup também pode falhar).

### Lição 2: Fallback silencioso é bug

`findBranchForRestaurant` retorna a primeira branch do DB quando não encontra correspondência direta. Isso atribui pedidos à filial errada silenciosamente — pior do que falhar explicitamente. **Fallback em lookup de negócio deve lançar erro, não retornar valor default.**

### Lição 3: Idempotência é obrigatória para POSTs de criação

Sem `Idempotency-Key` ou constraint unique em `(user_id, created_at, restaurant_id, total)`, double-click em mobile com 3G instável cria pedidos duplicados. UUID v4 previne colisão de ID mas NÃO previne duplicação lógica.

### Lição 4: `db` proxy do Drizzle exige cuidado com lint

O proxy em `server/src/db/index.ts:26-35` faz `getProvider()` dinâmico. Em novos arquivos, ESLint strict-type-checked infere `unknown` para property chains. Pattern que funciona: usar `db.transaction(async (tx) => { await tx.insert(...) })` — o `tx` tem tipo concreto, ao contrário do `db` que é Proxy.

### Lição 5: FK implícita (mesmo PK) sem constraint = débito técnico

`orders.id = merchantOrders.id` é convenção sem FK. Qualquer endpoint futuro que crie `merchantOrders` sem passar pelo mirror diverge as tabelas. Solução: adicionar FK `merchantOrders.id → orders.id` (quando refactorar).

### Lição 6: Sem reconciliação = órfãos permanentes

Não existe job de reconciliação nem query de detecção de órfãos. Adicionar query de monitoramento:
- `SELECT * FROM orders o LEFT JOIN merchant_orders mo ON mo.id = o.id WHERE mo.id IS NULL` (orders sem mirror)
- `SELECT * FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id WHERE oi.id IS NULL` (orders sem items)
