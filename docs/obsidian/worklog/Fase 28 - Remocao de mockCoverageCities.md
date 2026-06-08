---
type: worklog
status: concluded
created_at: 2026-06-05
updated_at: 2026-06-05
related:
- ADR-003
- CURRENT_STATE.md
- MEMORY.md
tags:
- type/worklog
- phase/28
- domain/geolocation
---

# Fase 28 — Remoção de mockCoverageCities + Migração para Cobertura Geofencing-Ready

## Objetivo

Substituir a whitelist estática `mockCoverageCities` pela cobertura derivada de `restaurants.is_active`, tornando o sistema **geofencing-ready** com suporte a cidade, bairro, raio e polígono.

## Decisão Arquitetural

Consulte [[ADR-003 Cobertura Geofencing-Ready]].

## Sub-fases

### 28.1 — Schema, DTOs e Fixtures ✅

**Entregas:**
- `server/src/db/schema/core/restaurants.ts`: adicionado `is_active:boolean`, `delivery_radius_km:integer`, `coverage_zone_type:enum(city|neighborhood|radius|polygon)`, `coverage_polygon:jsonb`; 3 novos índices
- Migration `drizzle/0011_next_miss_america.sql`: executada; DB alinhado via psql
- `src/dto/restaurantDto.ts`: novos campos + tipos `ActiveCityDTO`, `ActiveNeighborhoodDTO`, `RestaurantAvailabilityDTO`
- `src/types/restaurant.ts` + `src/domain/entities/Restaurant.ts`: campos propagados
- `src/mappers/restaurantMapper.ts`: `restaurantDtoToModel` propagando novos campos
- 3 fixtures atualizadas com Franca-SP + 4 bairros reais + `isActive:true`

### 28.2 — Backend Endpoints ✅

**Entregas:**
- `server/src/services/cityAvailabilityService.ts`: service dual-mode (memory/postgres)
- `server/src/routes/city-coverage.ts`: `GET /cities/active`, `GET /neighborhoods/active`, `GET /cities/has-coverage`, `GET /neighborhoods/has-coverage`
- `server/src/routes/restaurant-availability.ts`: `PUT /restaurants/:id/availability`
- `server/src/index.ts`: rotas registradas com rate limits
- `server/src/services/cityAvailabilityService.test.ts`: 8 testes

### 28.3 — Frontend Hooks ✅

**Entregas:**
- `src/api/citiesApi.ts`: `listActive()`, `listActiveNeighborhoods()`, `hasCityCoverage()`, `hasNeighborhoodCoverage()`
- `src/api/restaurantAvailabilityApi.ts`: `setAvailability()`
- `src/api/queryKeys.ts`: `citiesKeys` adicionados
- `src/hooks/useActiveCities.ts`: `useActiveCities()`, `useActiveNeighborhoods()`, `useCityCoverage()`, `useNeighborhoodCoverage()`
- Consumidores migrados: `useLiveCityEstablishments.ts`, `useNearbyRestaurants.ts`, `LocationSelector.tsx`
- `src/hooks/useToggleRestaurantAvailability.ts`: mutation para `setAvailability`
- `src/modules/admin/pages/AdminRestaurantsPage.tsx`: página de gestão com toggle `isActive`

### 28.4 — Remoção de Dead Code ✅

**Entregas (sessão atual 2026-06-05):**

Arquivos deletados:
- `server/src/routes/coverage-cities.ts`
- `server/src/services/coverageCityService.ts`
- `src/services/coverage/CityCoverageService.ts`
- `src/domain/services/CoverageCityApiService.ts`
- `server/src/db/schema/ops/coverage.ts`
- `shared/validations/coverageCity.ts`
- `src/hooks/useCoverageData.ts`
- `src/hooks/useCoverageCities.ts`
- `src/domain/entities/CoverageCity.ts`
- `src/services/cityCoverageService.test.ts`
- `src/infrastructure/memory/data/coverage-cities.ts`
- `src/mocks/handlers/coverage.ts`

Arquivos refatorados:
- `src/infrastructure/composition.ts` e `composition-postgres.ts`: removidas instâncias de `CoverageCityApiService`
- `src/modules/admin/index.ts`: removida rota `/admin/coverage` e `AdminCoveragePage`
- `src/mocks/handlers/index.ts`: removido export de `coverageHandlers`
- Fixtures: `superadmin.ts`, `src/infrastructure/memory/data-dto/superadmin.ts`
- `src/repositories/restaurantRepository.ts` e `src/mocks/handlers/restaurants.ts`: filtram `is_active === true`
- `src/services/cityCoverageFallback.ts`: `findRegisteredCityCoverage` agora síncrono; `getRegisteredCityCoverages` substituiu funções deletadas
- `LocationContext.tsx`: migrado para `CityCoverageResult` com schema `z.object()`
- `useLiveCityEstablishments.ts`: `useState`+`useEffect` → `useMemo`; import tipo corrigido
- `server/src/db/schema/ops/index.ts`: export `coverageCities` removido
- `server/src/routes/routes.test.ts`: seção "Coverage cities" removida (14 testes)
- `server/src/__tests__/contract/endpoint-parity.test.ts`: imports de `coverageCity` removidos; `mockCoverageCities` fixture deletado; describe "Coverage Cities" e drift test removidos
- `src/mocks/handlers/__tests__/handlers.test.ts`: describe "Coverage" removido
- `src/context/LocationContext.tsx`: `setManualCity` síncrono (`Promise<void>` → `void`)

### 28.5 — Documentação ✅

**Entregas (esta sessão):**
- Worklog criado
- CURRENT_STATE.md atualizado
- MEMORY.md atualizado

## Validação Final

| Check | Resultado |
|-------|-----------|
| `npx tsc -b` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros (1 warning pré-existente `OnlineStatusProvider`) |
| `npx vitest run` | ✅ 297/297 testes (28 arquivos) |
| `npm run build` | ✅ built in 19.46s |

## Pendências Remanescentes

| Item | Status | Observação |
|------|--------|------------|
| Remover `src/services/cityCoverageFallback.ts` | ⏸ Pendente | Aguarda confirmação de estabilidade dos consumidores |
| Proibição #9 (renomear `IpApiResponse`) | ⏸ Adiada | Cosmético |
| Seção 9 (cache L3-L5) | ⏸ Adiada | L2 já existe |
| Seção 7.3 (timeout GPS 25s→8s) | ⏸ Adiada | Decisão UX |
| Fase 17 (migração `CanonicalLocation` v2) | ⏸ Adiada | ~3-5 dias |

## Conclusão

Fase 28 concluída com sucesso. O sistema agora usa `restaurants.is_active` como fonte de verdade para cobertura geográfica, eliminando a whitelist estática `mockCoverageCities`. O modelo geofencing-ready está em vigor com suporte a `coverage_zone_type` (city/neighborhood/radius/polygon) e `coverage_polygon:jsonb`.