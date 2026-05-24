---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/architecture
---

# Frontend — Estrutura e Padrões

## Stack
```
React 19      → componentes server + client components
Vite 8        → build e HMR
TanStack Router v7 → roteamento por arquivo (lazy loading)
TanStack Query v5 → cache, invalidation, optimistic updates
Tailwind CSS 4 → @tailwindcss/postcss — CSS-first
Sonner        → toasts (<Toaster/> em ToastProvider)
```

## Carregamento de rotas (lazy)
```typescript
// App.tsx
const MerchantDashboardPage = React.lazy(() => import('./pages/merchant/MerchantDashboardPage'));
const RestaurantDetailPage = React.lazy(() => import('./pages/client/RestaurantDetailPage'));
const HomePage = React.lazy(() => import('./pages/client/HomePage'));

<Suspense fallback={<LoadingPage />}>
  <Route path="/" component={HomePage} />
  <Route path="/restaurant/:id" component={RestaurantDetailPage} />
  <Route path="/merchant" component={MerchantDashboardPage} />
</Suspense>
```

## React Query — camada de dados
```
cada endpoint → hook isolado em src/hooks/
ex: useRestaurants(), useNearbyRestaurants(key)
cada hook → usa useQuery / useMutation de @tanstack/react-query
query keys → centralizadas em src/services/queryKeys.ts
invalidations → explícitas: queryClient.invalidateQueries({ queryKey: ['restaurants'] })
```

## Rede — camada api/
```
src/services/api/       → httpClient (fetch wrapper)
src/services/api/*      → funções get/post/put/delete por recurso
src/repositories/       → server-side (MSW) — ingleses do frontend
src/hooks/              → useQuery bindings
```

## Localização e proximidade
```
src/services/locationService.ts          → geolocation (Geolocation API) + reverse geocode Nominatim
src/services/cityCoverageService.ts      → city guard, findRegisteredCityCoverage()
src/hooks/useLiveCityEstablishments.ts   → busca restaurantes por cidade + raio
src/hooks/useNearbyRestaurants.ts        → hook de proximidade com filtro de cidade habilitada
```

## Proximidade — fluxo completo
```
User posicionado
  → Geolocation.getCurrentPosition()
    → { lat, lon }
      → Nominatim reverse geocode
        → { city }
          → cityCoverageService.findRegisteredCityCoverage(city)
            → city ∈ { cidades registadas }?
              → SIM → buscar restaurantes por lat/lon dentro do raio da cidade
              → NÃO → exibir "Cidade não atendida" / não permitir busca de restaurantes
```

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[MOC — UI Primitives]]
