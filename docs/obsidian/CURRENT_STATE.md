---
type: state
status: active
aliases:
- Estado Atual
- Current State
- Status
- Estado
created_at: 2026-05-23
updated_at: 2026-06-04
related:
- MEMORY.md
tags:
- type/state
---

# Estado Atual

## Fase atual

**Fase 26 — Pipeline de Geocoding + Persistência de Endereços/Filiais** ✅ **CONCLUÍDA** (2026-06-04)

Solicitado pelo usuário em 2026-06-04. O sistema agora retorna **posição + cidade + bairro + rua + número corretos** no autocomplete e no reverse geocode, e `AddressBookPage`/`MerchantBranchesPage` persistem via API (mock em dev, real em prod).

### Entregas (2 fases)

#### Fase 1 — Pipeline de Geocoding

| Camada | Mudança |
|---|---|
| `IGeocodingProvider.ts` | + `street?`/`number?` em `ReverseGeocodeResult` e `ForwardGeocodeResult` |
| `GeocodingProviders.ts` | Nominatim reverse: `zoom=18` + `addressdetails=1`; Photon reverse+forward: extrair `name`/`street`/`housenumber`; `parseReverseResponse` popula `street`/`number` |
| `nominatimApi.ts` | + `road`/`pedestrian`/`house_number`/`building` em `NominatimSearchResult.address` |
| `addressAutocompleteService.ts` | + `number` em `AutocompleteSuggestion`; `buildSuggestion` mapeia `p.housenumber`→`number`; `geocodeAddress` extrai `road`/`house_number` |
| `useAddressSearch.ts` | `confirmAddress` não sobrescreve mais `query` com `formattedAddress` |
| `AddressAutocomplete.tsx` | + `number`/`coordinates` no contrato `onChange` |
| 3 consumers (FxAddressForm, AddressBookPage, MerchantBranchesPage) | + `number` (e `coordinates` no merchant) no `handleAutocompleteChange` |

#### Fase 2 — Persistência

| Camada | Mudança |
|---|---|
| `src/dto/addressDto.ts` | **NOVO** — `AddressDTO`, `CreateAddressRequest`, `UpdateAddressRequest` |
| `src/types/customer.ts` | **NOVO** — `Address` model compartilhado |
| `src/mappers/addressMapper.ts` | **NOVO** — DTO↔Model + request builders |
| `src/api/addressApi.ts` | **NOVO** — CRUD `/me/addresses` |
| `src/repositories/addressRepository.ts` | **NOVO** — getAddresses/createAddress/updateAddress/setDefaultAddress/deleteAddress |
| `src/hooks/useAddresses.ts` | **NOVO** — `useAddresses` + 4 mutations (create/update/setDefault/delete) |
| `src/api/queryKeys.ts` | + `consumerKeys.addresses` |
| `src/dto/merchantDto.ts` | + `cep`/`number`/`latitude`/`longitude` em `MerchantBranchDTO`; **NOVO** `CreateBranchRequest`/`UpdateBranchRequest` |
| `src/mappers/merchantMapper.ts` | `branchDtoToModel` mapeia campos reais (antes: hardcoded `''`) |
| `src/api/merchantApi.ts` | + `createBranch`/`updateBranch`/`deleteBranch` |
| `src/repositories/merchantRepository.ts` | + `createBranch`/`updateBranch`/`deleteBranch` |
| `src/hooks/useMerchantData.ts` | + `useCreateBranch`/`useUpdateBranch`/`useDeleteBranch` |
| `server/src/routes/addresses.ts` | **NOVO** — GET/POST/PUT/POST `/:id/default`/DELETE com `authMiddleware` + Zod + ownership por `user_id` |
| `server/src/routes/branches.ts` | + POST/PUT/DELETE com `requirePermission({roles:['merchant','admin','superadmin']})` + `requireTenantOwnership('branchId')` + Zod |
| `server/src/index.ts` | + `api.route('/me/addresses', addressesRoutes)` |
| `src/mocks/fixtures/merchant.ts` | `mockBranches` com `cep`/`number`/`neighborhood`/`latitude`/`longitude` |
| `src/mocks/fixtures/customer.ts` | **NOVO** — `mockAddresses` |
| `src/mocks/handlers/customer.ts` | **NOVO** — addresses CRUD via MSW |
| `src/mocks/handlers/merchant.ts` | + POST/PUT/DELETE branches (com `branchesStore` local mutável) |
| `src/mocks/handlers/index.ts` | + `...customerHandlers` |
| `src/mocks/fixtures/index.ts` | + export `customer` |
| `src/pages/AddressBookPage.tsx` | Local state → `useAddresses` + `useCreateAddress`/`useDeleteAddress`/`useSetDefaultAddress` + `FxQueryBoundary` |
| `src/modules/merchant/pages/MerchantBranchesPage.tsx` | `addBranch` agora chama `useCreateBranch` mutation com DTO; popula `coordinates`/`latitude`/`longitude` no submit |

### Bloqueio

- **2.22 CheckoutPage → useLocationContext**: **CANCELADO** — `src/services/locationService.ts` está deletado (9 arquivos importam dele). Para habilitar seria necessário restaurar `locationService.ts`, fora do escopo desta fase. Mantido hardcoded `'Franca'/'SP'` que está correto para o usuário de referência.

## Validação

| Check | Resultado |
|-------|-----------|
| Lint (todos os arquivos do repo) | ✅ **0 errors** |
| Typecheck (todos os arquivos do repo) | ✅ **0 errors** |
| Server tests | ✅ **9/9 files, 147/147 tests passing** |
| Frontend tests | ✅ **18/18 files, 150/150 tests passing** |
| **Total** | ✅ **27/27 test files, 297/297 tests passing** |

## Decisões recentes

| Decisão | Status |
|---------|--------|
| [[ADR-001 ViaCEP como fonte oficial de bairro]] | ✅ Aprovado |
| Geocoding permanece real (não mock) em dev | ✅ Decisão atual mantida |
| Address data persiste via API (mock MSW em dev, Drizzle/Hono em prod) | ✅ Implementado |
| MSW handlers usam store mutável para CRUD (mock em memória) | ✅ Implementado |
| Vitest `resolve.alias` para `@/` e `src/` (vitest não lia tsconfig paths automaticamente) | ✅ Implementado |
| Defines `__MOCK_RESTAURANTS__`/`__MOCK_ORDERS__`/`__DB_PROVIDER__` (mesmo padrão de `__USE_MOCK__`) | ✅ Implementado |
| Migração dos consumidores de `locationService.ts` para `geodesy.ts`/`locationMachine.ts` | ✅ Implementado (7 arquivos) |
| `useUpdateDeliveryStatus` adicionado em `useCourierData.ts` (mapeando `in_route`→`dispatched`) | ✅ Implementado |
| Mock de `useAuthSession` corrigido para `useAuth` em `GuestRoute.test.tsx` | ✅ Implementado |

> [!tip] Navegação
> [[MEMORY|Obsidian MEMORY]] · [[MOC — Histórico do Projeto]]
