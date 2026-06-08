---
type: worklog
status: active
created_at: 2026-06-06
updated_at: 2026-06-06
related:
  - "[[CURRENT_STATE]]"
  - "[[MEMORY]]"
tags:
  - type/worklog
  - domain/core
  - layer/L1
  - phase/29
aliases:
  - Fase 29 - Coordenadas Reais e Geocodificacao
  - Phase 29 - Real Coordinates and Geocoding
---
# Fase 29 — Coordenadas Reais + Geocoding Refinado + Mobile ✅ CONCLUÍDA

> [!info] Status
> ✅ **CONCLUÍDA** (2026-06-06) — 6 sub-fases, 297/297 testes, build OK.

# Fase 29 — Coordenadas Reais + Geocoding Refinado + Mobile ✅ CONCLUÍDA

> [!info] Status
> ✅ **CONCLUÍDA** (2026-06-06) — 6 sub-fases, 297/297 testes, build OK.

## Objetivo

1. **Realismo de dados** — substituir coordenadas sintéticas (offsets/centroides) por coordenadas reais validadas via Google Maps para todos os restaurants do fixture.
2. **Precisão de bairro** — corrigir bairro errado retornado por Nominatim/OSM usando ViaCEP (fonte oficial Correios) como refinamento.
3. **Aderência ao contrato** — implementar Governança de Geocoding (Fase 0 + 0.1) já aprovada em [[ADR-001]] e [[ADR-002]].
4. **Mobile-readiness** — corrigir páginas vazias no celular (pendente).

## Decisões

- **Fase 29.1**: coordenadas reais são **fonte de verdade**; o Drizzle DB é atualizado de fixture para essas coordenadas; **não** persistir em arquivo paralelo.
- **Fase 29.2**: Bahia Lanches adicionado como `rest-9` com coords validadas (endereço exato do Google Maps).
- **Fase 29.3**: `inFlightRef` em vez de debounce — solução determinística, sem timing dependency.
- **Fase 29.4**: `findRegisteredCityCoverage` local **e** backend `useCityCoverage` em paralelo — fallback local corrige Franca no dev (Drizzle vazio) sem alterar backend.
- **Fase 29.5**: na divergência Nominatim↔ViaCEP, o `refineNeighborhoodByAddressLookup` faz busca ViaCEP por endereço (`/ws/SP/Franca/<street>/json/`) e pontua candidatos por overlap de palavras.

## Sub-fases

### ✅ 29.1 — Coordenadas reais Google Maps (8 restaurants)

Arquivos editados:
- `src/mocks/fixtures/restaurants.ts` — 8 restaurants com `latitude`/`longitude` reais

Tabela consolidada (validação usuário):

| id | nome | lat | lng | precisão |
|----|------|-----|-----|----------|
| rest-1 | Burger House | -20.5304942 | -47.4429064 | Google Maps |
| rest-2 | Pizza Napoli | -20.5394022 | -47.4475296 | Google Maps |
| rest-3 | Sakura Sushi | -20.5272914 | -47.4508903 | Google Maps |
| rest-4 | El Mexicano | -20.5457036 | -47.4504907 | Google Maps |
| rest-5 | Açaí da Vila | -20.5394042 | -47.4489680 | Google Maps |
| rest-6 | Green Bowls | -20.5418062 | -47.4495716 | Google Maps |
| rest-7 | Dona Maria | -20.5460903 | -47.4498617 | Google Maps |
| rest-8 | Doceria Sabor & Arte | -20.5482814 | -47.4487867 | Google Maps |

### ✅ 29.2 — `rest-9` Bahia Lanches

- Adicionado em `src/mocks/fixtures/restaurants.ts` e `data-dto/restaurants.ts`
- Coords: -20.5274671, -47.440134
- Culinária: Lanches
- Bairro inferido (São José)

### ✅ 29.3 — Correção loop infinito `/api/restaurants`

- `useEffect` em `CityRestaurantsPage.tsx:30-34`: removido `loading` do array de deps
- `inFlightRef = useRef(false)` em `useLiveCityEstablishments.ts:13` como guarda
- Resultado: 0 chamadas extras em 5s (antes: 26)

### ✅ 29.4 — Fix cobertura Franca em `useLiveCityEstablishments`

- Adicionado `findRegisteredCityCoverage` (fallback local) ao cálculo de `hasCityCoverage`:
  ```ts
  const hasCityCoverage = cityCoverageQuery.data === true || (supportedCity?.isActive ?? false);
  ```
- Resultado: `/nearby` raio 5km mostra 6 restaurants; raio 12km mostra 9

### ✅ 29.5 — Refinamento ViaCEP por endereço

Arquivo: `src/services/geocoding/viacepEnricher.ts`

```ts
async function refineNeighborhoodByAddressLookup(args: {
  uf: string;
  city: string;
  street: string;
  currentPostcode: string;
  nominatimNeighborhood: string;
}): Promise<NeighborhoodRefinement | null>
```

Fluxo:
1. Extrai 2 primeiras palavras do logradouro Nominatim
2. Chama ViaCEP `/ws/SP/Franca/<street>/json/`
3. Pontua candidatos por overlap de palavras (case-insensitive)
4. Aplica match se score > 0 e o bairro difere do Nominatim

**Resultado:** -20.5305, -47.4427 → "Jardim São Gabriel" (ViaCEP oficial) ao invés de "Residencial Júlio Délia" (Nominatim OSM).

### ✅ 29.6 — Mobile (CONCLUÍDA 2026-06-06)

**Causa raiz:**
1. Cert mkcert só cobria `localhost`/`127.0.0.1`/`::1` — IP da LAN (192.168.0.9) rejeitado pelo navegador mobile
2. Navbar com 3 botões 44px + logo 40px + location 70px = overflow 21px no mobile 375px
3. Carrosséis `-mx-4` no `/restaurants` empurravam body.scrollWidth para 396px
4. Cache stale em localStorage segurava coordenadas antigas

**Arquivos editados/criados:**
- `scripts/generate-dev-certs.mjs` (**NOVO**) — detecta IP LAN via `os.networkInterfaces()` + mkcert
- `package.json` — `certs:generate` e `setup:dev` agora usam o script Node
- `index.html` — 5 meta tags (viewport-fit, theme-color, apple-mobile-web-app, mobile-web-app, format-detection)
- `src/index.css` — `body { overflow-x: hidden }` + utilities `pt-safe/pl-safe/pr-safe`
- `src/components/navigation/FxNavbar.tsx` — location com `max-w-[70px] sm:max-w-[160px]`, padding `px-3 sm:px-4`, gap `gap-2 sm:gap-3`
- `src/components/ui/ThemeToggle.tsx` — `w-10 h-10 sm:w-11 sm:h-11`, ícones 18px
- `src/services/geolocationService.ts` — `isCacheStaleForCoords(fresh)` com haversine 5km
- `src/context/LocationContext.tsx` — chama `progressiveGeolocation` mesmo com cache + `isCacheStaleForCoords`
- `src/mocks/handlers/__tests__/handlers.test.ts` — `body.length` 8 → 9
- `src/services/geocoding/viacepEnricher.ts` — corrigidos 3 lints (29.5 retroativo)

**Validação (Playwright mobile 390x844):**
- ✅ Home: 9 restaurants, categorias, tab bar
- ✅ `/nearby`: "Jardim São Gabriel / Franca - SP", 7 restaurants, raio 5km
- ✅ `/restaurants`: 9 encontrados, categorias roláveis
- ✅ Body sem overflow horizontal

## Validação Final

| Check | Resultado |
|-------|-----------|
| `npx tsc -b` | ✅ exit 0 |
| `npm run lint` | ✅ 5 problemas pré-existentes (Fase 27/28) |
| `npx vitest run` | ✅ 297/297 (28 files, 79.93s) |
| `npm run build` | ✅ built in 9.46s |

## Bloqueios

- (nenhum)
