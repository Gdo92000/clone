---
type: knowledge
status: active
domain: domain/core
layer: layer/L1
moc: MOC Backend
created_at: 2026-06-06
updated_at: 2026-06-06
related:
  - src/utils/format.ts
  - src/utils/states.ts
  - src/mappers/restaurantMapper.ts
  - src/mappers/addressMapper.ts
  - src/mappers/merchantMapper.ts
  - src/providers/locationMachine.ts
  - src/context/LocationContext.tsx
  - src/services/geolocationService.ts
  - src/mocks/handlers/cities.ts
supersedes: []
tags:
  - type/knowledge
  - domain/core
  - layer/L1
  - tech/drizzle
  - tech/postgres
  - tech/geolocation
aliases:
  - Numeric Coercion
  - State Normalization
  - Geolocation Cache
  - Dev vs Prod
---

# Dev vs Production — Comportamentos Diferenciados

> **Propósito**: Documentar quais comportamentos do sistema ocorrem apenas em desenvolvimento (localhost, LAN IP, MSW) versus os que se aplicam em produção (HTTPS, Postgres real, sem MSW).

## 1. Postgres NUMERIC → string no Drizzle

### Comportamento
O driver `postgres-js` + Drizzle ORM serializa colunas `numeric(precision, scale)` como **string** no JavaScript. Isso é intencional para preservar precisão financeira (`5.00` vs `5` vs `5.00000001`), mas causa divergência entre:

- **DTO TypeScript**: `delivery_fee: number` (intencional para o modelo UI)
- **Runtime wire format**: `"5.00"` (string do Postgres)

### Onde se manifesta
- **Backend Hono routes** (`server/src/routes/*.ts`) que retornam `db.select().from(restaurants)` raw: o JSON serializa com strings.
- **Mobile (LAN IP)**: recebe `"5.00"` e renderiza com `.toFixed(2)` → **TypeError**.
- **PC (localhost)**: MSW intercepta a request e devolve fixture com `delivery_fee: 5.00` (number) → funciona.

### Resolução arquitetural
A camada de **mappers** (`src/mappers/*.ts`) é o seam único de normalização:

```ts
// src/utils/format.ts
export function coerceNumeric(value: unknown): number | null { ... }
export function coerceNumericOrZero(value: unknown): number { ... }
export function coerceNumericOrUndefined(value: unknown): number | undefined { ... }
```

Aplicado em:
- `restaurantMapper.ts:13-30` — `delivery_fee`, `rating`, `latitude`, `longitude`, `delivery_radius_km`
- `menuItemDtoToModel` — `price`, `original_price`
- `additiveDtoToModel` — `price`
- `addressMapper.ts:5-20` — `latitude`, `longitude`
- `merchantMapper.ts` — `delivery_radius_km`, `price`, `total`, `items.price`

### Por que NÃO no backend?
Considerado e rejeitado: alterar `c.json(all)` em cada uma das 40+ rotas para fazer `Number()` por campo NUMERIC. Problema: polui cada rota com lógica de coerção, multiplica pontos de mudança quando schema evolui. Mapper é o ponto único — single point of fix.

### Por que NÃO no Drizzle config (`mode: 'number'`)?
Considerado: `numeric('delivery_fee', { precision: 10, scale: 2 }, { mode: 'number' })`. Problema: `mode: 'number'` usa JS `Number` que perde precisão para valores monetários grandes (>2^53). String é correto para finanças; mapper converte só onde a precisão JS é suficiente (UI rendering).

### Aplicação em produção
**Aplica-se em produção**. O bug nunca foi visível em prod porque o frontend sempre rodou em localhost (dev) onde MSW mascarava o problema. A correção no mapper é obrigatória antes de qualquer deploy em produção mobile ou web.

---

## 2. UF format inconsistency (Nominatim vs fixture vs IP API)

### Comportamento
Diferentes fontes de geolocalização retornam `state` em formatos diferentes:

| Fonte | Formato `state` | Exemplo |
|-------|-----------------|---------|
| `cityCoverageFallback.ts` (seed estática) | código UF 2 letras | `"SP"` |
| `LocationContext.setManualCity` | código UF 2 letras | `"SP"` |
| Nominatim (GPS reverse) | nome completo | `"São Paulo"` |
| ipapi.co (IP fallback) | nome completo | `"São Paulo"` |
| ip-api.com (IP fallback alt) | código UF 2 letras | `"SP"` |
| Franca seed (`franca-dev.seed.ts`) | código UF 2 letras | `"SP"` |

### Onde se manifesta
- `useCityCoverage(city?.name, city?.state)` chama `citiesApi.hasCityCoverage(city, state)`.
- Request vira `/cities/has-coverage?city=Franca&state=São Paulo`.
- MSW handler `deriveActiveCities()` retorna Franca com `state: "SP"`.
- Comparação `"SÃO PAULO" === "SP"` → `false` → **has-coverage = false**.
- Consequência: `useNearbyRestaurants` não filtra por distância, `useLiveCityEstablishments` mostra "fora do limite de Franca" ou lista vazia.

### Resolução arquitetural
Utilitário único `normalizeStateBR` (`src/utils/states.ts`) aplicado **na origem dos dados** (não no consumidor):

```ts
// src/utils/states.ts
export function normalizeStateBR(rawState: string | null | undefined): string {
  // 1. UF válida já → retorna
  // 2. Nome completo → mapeia via STATE_NAME_TO_CODE (27 UFs)
  // 3. Fallback: uppercase
}
```

Aplicado em:
- `LocationContext.tryIpFallback` — normaliza `ipData.state` antes de construir `City`
- `LocationContext.cityFromCache` — normaliza cache lido (caches antigos podem ter nome completo)
- `LocationMachine.locateCity` — `state: result.stateCode ?? result.state` (prefere 2-letter)
- `MSW handlers/cities.ts` — normaliza o `state` da query antes de comparar (defense-in-depth)

### Por que na origem?
- A contract do `City` interface (`locationMachine.ts:13-21`) define `state: string` e `stateCode: string` separadamente. Contratos futuros assumem `state` = código UF.
- Normalizar em cada consumidor (useCityCoverage, useActiveNeighborhoods, etc.) multiplica pontos de manutenção.
- Origem única: qualquer nova fonte de geolocalização (outro provider, novo método) já emite código UF.

### Aplicação em produção
**Aplica-se em produção**. Nominatim retorna `"São Paulo"` em prod também. A correção é obrigatória.

---

## 3. localStorage per-origin (localhost vs LAN IP)

### Comportamento
O cache de geolocalização usa `localStorage`, que é **per-origin** (não per-device). Quando o app roda em múltiplas origins:

| URL acessada | Origin | localStorage namespace |
|--------------|--------|------------------------|
| `http://localhost:5173/nearby` | `http://localhost:5173` | cache A |
| `http://192.168.0.9:5173/nearby` | `http://192.168.0.9:5173` | cache B (separado) |

Cada origin tem cache independente. O usuário vê **cidades/neighborhoods diferentes** entre hosts porque cada um cacheia separadamente.

### Onde se manifesta
- **Apenas em desenvolvimento** (PC dev acessa `localhost` e LAN IP alternadamente).
- Não acontece em produção: a app é servida de **uma única origin** (ex: `https://app.flux.delivery`).

### Mitigação aplicada (dev-only)
`src/services/geolocationService.ts:6-7`:
```ts
const CITY_TTL_PROD = 24 * 60 * 60 * 1000;
const CITY_TTL = import.meta.env.DEV ? 0 : CITY_TTL_PROD;
```

Em DEV: TTL=0 → cache sempre expira → re-geolocaliza toda vez → mesma origem não acumula divergência.
Em PROD: TTL=24h → otimização de UX (não pede permissão de GPS a cada load).

### Por que NÃO cache compartilhado backend?
Considerado: tabela `device_locations (device_id, city, ...)` no Postgres. **Rejeitado** nesta fase por:
- Backend passa por autenticação; cache anônimo de geolocalização requer fingerprint device (LGPD/GDPR).
- Adiciona latência de rede para ganho marginal (já existe cache `GeocodingService` in-memory com 24h).
- Solução atual (TTL=0 em DEV) resolve o problema sem custo arquitetural.

### Aplicação em produção
**NÃO se aplica em produção**. Em prod, `import.meta.env.DEV === false`, então `CITY_TTL === 24h` (comportamento normal de cache).

### Limitação conhecida
A correção não sincroniza cache entre hosts em dev. Se o usuário alterna rapidamente entre `localhost` e `192.168.0.9`, cada um dispara `progressiveGeolocation` independente. Isso é **aceitável** porque:
- Nominatim rate-limit é 1 req/s, mas o `GeocodingService` cacheia in-memory por 24h.
- O usuário é forçado a esperar 1-3s (leitura GPS) — UX aceitável em dev.

---

## 4. MSW interception scope

### Comportamento
MSW (Mock Service Worker) intercepta requests via service worker, que:
- É registrado por origin (uma vez por host:port).
- Requer **HTTPS ou localhost** para service worker (browser security).
- Não funciona em **mobile via LAN IP** a menos que o cert (mkcert) seja confiável.

### Onde se manifesta
- **PC localhost**: MSW intercepta tudo → PC vê dados de fixture (numbers, state="SP").
- **Mobile LAN IP**: MSW NÃO intercepta (ou porque o cert não é confiável no mobile, ou porque SW não está registrado) → mobile vai pro backend real → recebe strings, "São Paulo", divergências.

### Aplicação em produção
**NÃO se aplica em produção**. MSW só roda em dev (`import.meta.env.DEV === true` em `src/test/setup.ts`).

---

## 5. Auto-seed dev only

### Comportamento
`bootstrapDev()` em `server/src/index.ts:251-261`:
```ts
if (NODE_ENV !== 'development') return;
try {
  const result = await seedFrancaDev(false);
  ...
}
```

### Onde se manifesta
- Em dev: o backend popula 9 restaurants Franca se a tabela estiver vazia.
- Em prod: zero impacto (early return).

### Aplicação em produção
**NÃO se aplica em produção**. Seed é explicitamente gated por `NODE_ENV === 'development'`.

---

## Resumo executivo

| Comportamento | Dev (localhost) | Dev (LAN IP) | Produção |
|---------------|-----------------|--------------|----------|
| Postgres NUMERIC → string | mascarado por MSW | **visível** (mappers aplicam coerção) | **aplicável** |
| UF format inconsistency | mascarado por MSW (fixture "SP") | **visível** (Nominatim retorna "São Paulo") | **aplicável** |
| localStorage per-origin | **visível** (TTL=0 força refresh) | **visível** (TTL=0) | **não aplicável** (origem única) |
| MSW interception | ativo | depende de cert | **não ativo** |
| Auto-seed Franca | ativo | ativo | **não ativo** |

**Conclusão**: Os fixes de mapper + normalizeStateBR são **obrigatórios para produção**. As mitigações de cache TTL=0 e ajustes MSW são **dev-only** e devem ser documentadas para evitar confusão em sessões futuras.
