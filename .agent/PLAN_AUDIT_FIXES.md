# Plano de Correções Pós-Auditoria

> Fases executadas sequencialmente. Cada fase só começa quando a anterior está 100% concluída.

---

## Fase 1 — Segurança CRÍTICA (Backend)

**Objetivo:** Eliminar falhas de segurança que expõem o sistema.

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 1.1 | Remover credenciais reais do `.env` e `.env.example`; adicionar `.env` ao `.gitignore` | `.env`, `.env.example`, `.gitignore` | 5min |
| 1.2 | Restringir CORS para origens conhecidas | `server/src/index.ts:16` | 5min |
| 1.3 | Implementar `app.onError` global com resposta JSON estruturada | `server/src/index.ts` | 10min |
| 1.4 | Implementar JWT (`@hono/jwt`) + bcrypt no login | `server/src/routes/auth.ts`, `package.json` | 30min |
| 1.5 | Adicionar middleware JWT de autenticação nas rotas protegidas | `server/src/index.ts`, `server/src/middleware/auth.ts` | 20min |
| 1.6 | Rodar build do servidor e testar login flow | `server/` | 10min |

**Critério de aceitação:** Login rejeita senha errada, retorna JWT assinado, CORS bloqueia origens não autorizadas, toda rota protegida valida token.

**Duração estimada:** ~1.5h

---

## Fase 2 — Backend API Robustez

**Objetivo:** Eliminar rotas sem validação, sem try/catch, e sem persistência.

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 2.1 | Adicionar `zValidator` em todas as rotas que faltam (date, year, id params) | `server/src/routes/holidays.ts`, `server/src/routes/operations.ts` | 20min |
| 2.2 | Implementar `db.insert()` no `POST /api/restaurants` | `server/src/index.ts:37-46` | 15min |
| 2.3 | Centralizar schemas Zod do shared em vez de duplicar nas routes | `shared/validations/operations.ts` ↔ `server/src/routes/operations.ts` | 15min |
| 2.4 | Adicionar `.max()` constraints em todos os campos string nos schemas Zod | `shared/validations/restaurant.ts`, `shared/validations/address.ts` | 10min |
| 2.5 | Rodar `npm run build` e testar rotas | `server/` | 10min |

**Critério de aceitação:** Toda rota valida params antes de tocar o DB, POST persiste dados, schemas centralizados.

**Duração estimada:** ~1h

---

## Fase 3 — Sistema de Horários (Overnight/Holidays)

**Objetivo:** Corrigir bugs críticos de detecção de horário noturno e feriados.

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 3.1 | Mover yesterday-overnight check para ANTES do "today is closed" early return | `server/src/services/operations/opening-status.ts:303-319` | 5min |
| 3.2 | Iterar TODOS os períodos de ontem (não só o último) no overnight check | `server/src/services/operations/opening-status.ts:350-351` | 10min |
| 3.3 | Corrigir `open_normal` para preservar `overrideLabel` | `server/src/services/operations/opening-status.ts:222-255` | 10min |
| 3.4 | Substituir `getNow()` por implementação robusta com `Intl.DateTimeFormat.formatToParts` | `server/src/services/operations/opening-status.ts:14-16` | 10min |
| 3.5 | Adicionar overlap detection nos schemas de período (business hours, special dates) | `server/src/routes/operations.ts:16-63` | 15min |
| 3.6 | Adicionar validação de cronológica de `sort_order` | `server/src/routes/operations.ts` | 5min |
| 3.7 | Rodar build e testes lógicos | `server/` | 10min |

**Critério de aceitação:** Overnight shifts detectados corretamente. Feriados preservam label. `getNow()` é timezone-safe. Conflitos de período são rejeitados.

**Duração estimada:** ~1h

---

## Fase 4 — Drizzle Schema & Migrations

**Objetivo:** Sincronizar schema com a documentação e gerar migrations.

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 4.1 | Adicionar indexes faltantes nas tabelas (coupons, campaigns, notifications, feature_flags, users, companies) | `server/src/db/schema/commerce/coupons.ts`, `campaigns.ts`, `ops/notifications.ts`, `saas/feature-flags.ts`, `customer/users.ts`, `merchant/companies.ts` | 30min |
| 4.2 | Adicionar FKs faltantes (`users.company_id`, `users.branch_id`, `companies.plan_id`) | `server/src/db/schema/customer/users.ts`, `merchant/companies.ts` | 15min |
| 4.3 | Adicionar unique constraints (`business_hours.branch_id+weekday`, `special_dates.branch_id+date`, `holiday_overrides.branch_id+custom_date`) | `server/src/db/schema/operations/business-hours.ts`, `special-dates.ts`, `holiday-overrides.ts` | 15min |
| 4.4 | Adicionar índice GiST em `restaurants (latitude, longitude)` | `server/src/db/schema/core/restaurants.ts` | 10min |
| 4.5| Converter `invoices.status` de `text` para `pgEnum` | `server/src/db/schema/saas/subscriptions.ts` | 10min |
| 4.6 | Remover ou atualizar `server/src/db/schema/indexes.ts` (dead documentation) | `server/src/db/schema/indexes.ts` | 5min |
| 4.7 | Rodar `drizzle-kit generate` e validar migrations | `server/` | 15min |

**Critério de aceitação:** Schema tem todos os indexes, FKs, e unique constraints documentados. Migrations geradas com sucesso.

**Duração estimada:** ~1.5h

---

## Fase 5 — Frontend: Loading / Error / Empty States

**Objetivo:** Nenhuma página deve ficar sem feedback visual para o usuário.

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 5.1 | Adicionar handler de `isError` + `error` em TODAS as 13 merchant pages | `Merchant*Page.tsx` | 1h |
| 5.2 | Adicionar loading state no MerchantDashboardPage, MerchantAnalyticsPage, MerchantFinancePage | `MerchantDashboardPage.tsx`, `MerchantAnalyticsPage.tsx`, `MerchantFinancePage.tsx` | 20min |
| 5.3 | Adicionar loading state no MerchantTeamPage, MerchantSubscriptionPage, MerchantCouponsPage, MerchantSettingsPage | `MerchantTeamPage.tsx`, `MerchantSubscriptionPage.tsx`, `MerchantCouponsPage.tsx`, `MerchantSettingsPage.tsx` | 20min |
| 5.4 | Adicionar empty state em MerchantOrdersPage, MerchantCatalogPage, MerchantDashboardPage, MerchantFinancePage, MerchantTeamPage, MerchantCampaignsPage | 6 pages | 30min |
| 5.5 | Adicionar empty state em HomePage, FavoritesPage, AddressBookPage (customer pages) | 3 pages | 15min |
| 5.6| Componentizar `LoadingSpinner`, `ErrorMessage`, `EmptyState` em `src/components/ui/` | Novo | 20min |
| 5.7 | Rodar `npm run build` + ESLint | Root | 10min |

**Critério de aceitação:** Toda página mostra skeleton/spinner durante loading, mensagem de erro quando API falha, e estado vazio quando não há dados.

**Duração estimada:** ~3h

---

## Fase 6 — React Query: Cache, Invalidação, Stale Closures

**Objetivo:** Eliminar dados inconsistentes entre estado local e servidor.

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 6.1 | Adicionar `queryClient.invalidateQueries` após mutações locais em MerchantCouponsPage, MerchantCatalogPage, MerchantBranchesPage, MerchantTeamPage | 4 pages | 30min |
| 6.2 | Adicionar `staleTime` configurado nos hooks `useMerchantData` (30-60s para merchant data) | `src/hooks/useMerchantData.ts` | 10min |
| 6.3 | Adicionar `enabled: !!restaurantId` no `useMenuItems` | `src/hooks/useRestaurants.ts:19` | 5min |
| 6.4 | Normalizar `queryKey` naming (aninhar sob `['restaurant', id]`) | `src/hooks/useRestaurants.ts` | 10min |
| 6.5 | Fix MerchantCatalogPage: parar de sincronizar `items` via `useEffect` (usar `localItems` como source of truth sem overwrite) | `MerchantCatalogPage.tsx:24-27` | 15min |
| 6.6 | Adicionar `errorToast` no `onError` de `useUpdateOrderStatus` | `src/hooks/useMerchantData.ts:64-66` | 5min |
| 6.7 | Rodar `npm run build` + ESLint | Root | 10min |

**Critério de aceitação:** Mutações locais invalidam cache. Dados frescos são buscados após alterações. Stale closures eliminados.

**Duração estimada:** ~1.5h

---

## Fase 7 — Endereço, Geolocalização e Autocomplete

**Objetivo:** Coordenadas não são mais perdidas; dead code removido.

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 7.1 | Adicionar `latitude`/`longitude` nos tipos `Address` e `AddressData` | `src/types/index.ts`, `src/components/commerce/FxAddressForm.tsx` | 10min |
| 7.2 | Propagar coordenadas do autocomplete para o form (AddressBookPage, FxAddressForm) | `AddressBookPage.tsx`, `FxAddressForm.tsx` | 15min |
| 7.3 | Substituir `city: 'Franca'` hardcoded no CheckoutPage pelo valor do `LocationContext` | `CheckoutPage.tsx:19` | 5min |
| 7.4 | Adicionar `AbortController.signal` nos `fetch` do ViaCEP que estão sem | `src/services/addressAutocompleteService.ts:248,521` | 10min |
| 7.5 | Remover dead code `src/hooks/useGeolocation.ts` e mover `Coordinates` type | `src/hooks/useGeolocation.ts`, `src/types/geolocation.ts` | 15min |
| 7.6 | Adicionar normalização de acentos no `filterByCity` | `src/services/addressAutocompleteService.ts:407-410` | 5min |
| 7.7 | Limitar ViaCEP enrichment results a 8 | `src/services/addressAutocompleteService.ts:272` | 5min |
| 7.8 | Rodar `npm run build` + ESLint | Root | 10min |

**Critério de aceitação:** Endereços salvos têm coordenadas. ViaCEP usa AbortController. dead code removido. filterByCity normaliza acentos.

**Duração estimada:** ~1.5h

---

## Fase 8 — Performance: Lazy Loading e Bundle

**Objetivo:** Reduzir bundle inicial eliminando imports pesados desnecessários.

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 8.1 | Lazy-load Leaflet no AddressMap com `React.lazy` + dynamic `import('leaflet')` | `src/components/address/AddressMap.tsx` | 20min |
| 8.2 | Verificar se `merchantData.js` continua fora do bundle (já feito, confirmar) | `dist/assets/` | 5min |
| 8.3 | Analisar bundle com `vite build --analyze` (ou source-map-explorer) para identificar oportunidades | `dist/assets/` | 15min |
| 8.4 | Rodar `npm run build` e comparar tamanhos de chunk | Root | 5min |

**Critério de aceitação:** Leaflet (~200KB) só carrega quando AddressMap é montado. merchantData não está no bundle.

**Duração estimada:** ~45min

---

## Fase 9 — Polimento Final

**Objetivo:** Últimos ajustes de qualidade de código.

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 9.1 | Substituir `navigate('/')` por `navigate(ROUTES.HOME)` nos 8 arquivos | `MerchantLayout.tsx`, `DashboardLayout.tsx`, `ExperienceLayout.tsx`, `useNavItems.tsx`, `FxNavbar.tsx`, `RestaurantDetailPage.tsx`, `ProfilePage.tsx`, `TrackingPage.tsx` | 15min |
| 9.2 | Adicionar `merchantBranchHref`, `merchantOrderHref`, `merchantItemHref` em `routes.ts` | `src/lib/routes.ts` | 10min |
| 9.3 | Remover barrel `index.ts` não utilizados ou converter para re-export de lazy routes | `src/modules/*/index.ts` | 10min |
| 9.4 | Adicionar `.max()` limits nos schemas Zod do frontend | `shared/validations/` | 10min |
| 9.5 | Auditoria final: `npm run build` + `npx eslint src` + `npx tsc --noEmit` | Root | 10min |

**Critério de aceitação:** Zero hardcoded paths. Route helpers para merchant. Schema validation completa.

**Duração estimada:** ~1h

---

## Resumo

| Fase | Descrição | Duração | Depende de |
|------|-----------|---------|------------|
| 1 | Segurança CRÍTICA | ~1.5h | — |
| 2 | Backend API Robustez | ~1h | Fase 1 |
| 3 | Sistema de Horários | ~1h | — |
| 4 | Drizzle Schema & Migrations | ~1.5h | — |
| 5 | Frontend Loading/Error/Empty | ~3h | — |
| 6 | React Query Cache | ~1.5h | Fase 5 |
| 7 | Endereço e Geolocalização | ~1.5h | — |
| 8 | Performance/Lazy Loading | ~45min | Fase 5 |
| 9 | Polimento Final | ~1h | Fase 8 |
| **Total** | | **~13h** | |

**Iniciar com Fase 1.** Informarei quando cada fase for 100% concluída antes de prosseguir.
