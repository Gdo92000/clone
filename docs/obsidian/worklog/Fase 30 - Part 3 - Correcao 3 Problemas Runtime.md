---
type: worklog
status: concluded
created_at: 2026-06-06
updated_at: 2026-06-06
related:
  - "[[CURRENT_STATE]]"
  - "[[MEMORY]]"
  - "[[Dev vs Production - Comportamentos Diferenciados]]"
tags:
  - type/worklog
  - domain/core
  - layer/L1
aliases:
  - Fase 30 Part 3
  - Correcoes Runtime
  - 3 Bugs Mobile
  - Numeric Coercion
  - State Normalization
  - Geolocation Cache
---

# Fase 30 — Part 3: Correção de 3 Problemas de Runtime

> Após teste físico em PC (localhost + LAN IP) e mobile, identificados 3 problemas que afetavam a experiência de uso real. Resolução em 4 entregas (mapper, util UF, fix LocationContext, mitigação dev cache).

## TL;DR

| # | Problema | Sintoma | Causa raiz | Fix |
|---|----------|---------|------------|-----|
| 1 | `deliveryFee.toFixed` crash | Mobile via LAN IP: TypeError ao renderizar cards | Drizzle NUMERIC→string + DTO number + mapper pass-through | `coerceNumeric` em 3 mappers |
| 2 | `has-coverage` = false | Franca não detectada como coberta em MSW dev | Nominatim/ipapi retorna UF como nome completo, fixture usa código | `normalizeStateBR` + fix em `locateCity` + `tryIpFallback` |
| 3 | LAN vs localhost divergente | PC `localhost` mostra bairro X, `192.168.0.9` mostra bairro Y | `localStorage` per-origin entre hosts | `CITY_TTL=0` em DEV (mitigação) |

**Validação**: lint 0/0, tsc ✅, 355/355 testes (+58 novos), build 22.03s.

---

## Problema 1 — `restaurant.deliveryFee.toFixed is not a function`

### Stack trace
```
TypeError: restaurant.deliveryFee.toFixed is not a function
  at FxRestaurantCard (src/components/commerce/FxRestaurantCard.tsx:108)
  at RestaurantListPage (src/pages/RestaurantListPage.tsx:254)
```

### Diagnóstico

| Ambiente | Fonte de dados | Tipo de `delivery_fee` no runtime |
|----------|---------------|-----------------------------------|
| PC `localhost:5173` | MSW intercepta `GET /api/restaurants` | **number** (`5.00` direto da fixture JS) |
| Mobile `https://192.168.0.9:5173` | Backend real Hono + Drizzle | **string** (`"5.00"` — Postgres NUMERIC) |

**Cadeia causal**:
1. `server/src/index.ts:133-136` retorna `db.select().from(restaurants)` raw.
2. Drizzle + postgres-js serializa `numeric(10,2)` como string (preserva precisão).
3. `RestaurantDTO.delivery_fee: number` em `src/dto/restaurantDto.ts:11` (tipo) ≠ runtime (string).
4. `src/mappers/restaurantMapper.ts:13` (antes) — `deliveryFee: dto.delivery_fee` (pass-through).
5. `FxRestaurantCard.tsx:108` — `restaurant.deliveryFee.toFixed(2)` → TypeError em string.

### Auditoria — todos os campos NUMERIC

Ver seção "Auditoria completa" abaixo. **9 entidades** com 16+ colunas NUMERIC afetam o frontend.

### Fix

**Arquivo 1 (novo)**: `src/utils/format.ts`
```ts
export function coerceNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
export function coerceNumericOrZero(value: unknown): number { return coerceNumeric(value) ?? 0; }
export function coerceNumericOrUndefined(value: unknown): number | undefined { return coerceNumeric(value) ?? undefined; }
```

**Arquivo 2**: `src/mappers/restaurantMapper.ts` — `coerceNumeric` em `delivery_fee`, `rating`, `latitude`, `longitude`, `delivery_radius_km`, `price`, `original_price`, `additive.price`.

**Arquivo 3**: `src/mappers/addressMapper.ts` — `coerceNumeric` em `latitude`, `longitude`.

**Arquivo 4**: `src/mappers/merchantMapper.ts` — `coerceNumeric` em `delivery_radius_km`, `price`, `total`, `items.price`.

### Decisões rejeitadas
- **Backend `Number()` por rota**: polui 40+ rotas, multiplica pontos de mudança.
- **Drizzle `mode: 'number'`**: usa JS Number que perde precisão para monetário grande (>2^53).
- **`as any`/`@ts-ignore`**: viola AGENTS.md.

### Testes adicionados
- `src/utils/format.test.ts` — 10 testes (strings, numbers, null, undefined, NaN, Infinity, espaços)
- `src/mappers/restaurantMapper.test.ts` — 16 testes (NUMERIC string→number em todos os 8 mappers cobertos)

---

## Problema 2 — MSW `GET /cities/has-coverage` retorna `false` para Franca

### Logs observados
```
[DEBUG] [MSW] GET /cities/has-coverage → 200
[MSW] 11:41:50 GET /api/cities/has-coverage (200 OK)
  body: { city: "Franca", state: "São Paulo", covered: false }  ← BUG
```

### Diagnóstico

**Cadeia causal**:
1. `LocationContext.requestLocation` → `progressiveGeolocation` → `locateCity(coords)`.
2. `locationMachine.ts:60-67` constrói City:
   ```ts
   state: result.state,  // "São Paulo" (nome completo do Nominatim)
   stateCode: result.stateCode ?? '',  // "SP" (separado)
   ```
3. `useCityCoverage(city?.name, city?.state)` chama `/cities/has-coverage?city=Franca&state=São Paulo`.
4. `src/mocks/handlers/cities.ts:54`:
   ```ts
   const covered = cities.some((c) =>
     c.city.toLowerCase() === city.toLowerCase() &&
     c.state.toUpperCase() === state.toUpperCase()  // "SP" === "SÃO PAULO" → false
   );
   ```
5. Franca fixture tem `state: "SP"` (código), request envia `"São Paulo"` (nome).

**Fontes de UF inconsistentes** (auditoria):

| Fonte | Formato |
|-------|---------|
| Franca seed (`franca-dev.seed.ts`) | `"SP"` |
| `cityCoverageFallback.ts:17` | `"SP"` |
| `LocationContext.setManualCity` | `"SP"` |
| Nominatim reverse (`GeocodingProviders.ts:94`) | `"São Paulo"` |
| ipapi.co (fallback primário) | `"São Paulo"` |
| ip-api.com (fallback alt) | `"SP"` |

### Fix

**Arquivo 1 (novo)**: `src/utils/states.ts` — `normalizeStateBR`:
```ts
const STATE_NAME_TO_CODE: Record<string, string> = {
  'sao paulo': 'SP', 'minas gerais': 'MG', /* 27 UFs */
};
export function normalizeStateBR(rawState: string | null | undefined): string {
  if (typeof rawState !== 'string') return '';
  const trimmed = rawState.trim();
  if (trimmed === '') return '';
  const upper = trimmed.toUpperCase();
  if (VALID_UF_CODES.has(upper)) return upper;  // já é código
  const normalized = stripAccents(trimmed.toLowerCase());
  const fromName = STATE_NAME_TO_CODE[normalized];
  if (fromName) return fromName;  // nome completo → código
  return upper;  // fallback
}
```

**Arquivo 2**: `src/providers/locationMachine.ts:60` — `state: result.stateCode ?? result.state` (prefere código).

**Arquivo 3**: `src/context/LocationContext.tsx:60-72` (`tryIpFallback`) — normaliza `ipData.state` antes de construir City.

**Arquivo 4**: `src/context/LocationContext.tsx:19-23` (`cityFromCache`) — normaliza cache lido (caches antigos podem ter nome completo).

**Arquivo 5**: `src/mocks/handlers/cities.ts:49-67` — defense-in-depth, normaliza state da query antes de comparar.

### Por que na origem
- Contrato `City` interface define `state: string` + `stateCode: string`. Consumidores futuros assumem `state` = código.
- Normalizar em cada consumer multiplica manutenção.
- Origem única: qualquer novo provider de geolocalização já emite código UF.

### Testes adicionados
- `src/utils/states.test.ts` — 32 testes:
  - Códigos UF válidos (case-insensitive, com trim)
  - Nomes completos (com/sem acentos)
  - Entradas inválidas (null, undefined, empty, unknown)
  - Caso real Nominatim/ipapi/ip-api → "SP"

---

## Problema 3 — `localhost` vs `192.168.0.9` mostram bairros diferentes

### Sintomas reportados
- `http://localhost:5173/nearby` → "Residencial São João Batista / Franca - SP"
- `http://192.168.0.9:5173/nearby` → "Jardim São Gabriel / Franca - SP"
- Mesmo PC, mesmo device, hosts diferentes = bairros diferentes.

### Diagnóstico

**Cadeia causal**:
1. `LocationContext` hidrata de `readCache()` (`geolocationService.ts:16-29`).
2. `storageService.get('city-cache')` lê de `localStorage`.
3. `localStorage` é **per-origin** (não per-device).
4. `http://localhost:5173` → origin A → cache A → cidade X
5. `http://192.168.0.9:5173` → origin B → cache B → cidade Y

Cada origin tem cache independente. PC alternando hosts vê estados inconsistentes.

### Fix (dev-only, conforme aprovação)

**Arquivo**: `src/services/geolocationService.ts:5-7`
```ts
const CITY_TTL_PROD = 24 * 60 * 60 * 1000;
const CITY_TTL = import.meta.env.DEV ? 0 : CITY_TTL_PROD;
const COORDS_TTL = 60 * 60 * 1000;
```

Em DEV: TTL=0 → cache sempre expira → re-geolocaliza toda vez → mesma origem não acumula divergência.
Em PROD: TTL=24h → otimização UX (não pede permissão GPS a cada load).

### Por que NÃO backend persistence (rejeitado)
- LGPD/GDPR: cache anônimo de geolocalização requer fingerprint device.
- Latência de rede para ganho marginal (já existe cache `GeocodingService` in-memory 24h).
- `GeocodingService` cacheia in-memory por 24h, então chamadas repetidas com mesmas coords não chegam ao Nominatim.
- Solução TTL=0 resolve sem custo arquitetural.

### Aplicabilidade
- **Apenas dev** (import.meta.env.DEV gate).
- Em prod, app serve de uma única origin → `localStorage` namespace único → sem divergência.
- Limitação: alternar rapidamente entre `localhost` e `192.168.0.9` em dev dispara GPS em cada um. Aceitável (Nominatim cache in-memory evita rate-limit).

---

## Auditoria completa de campos NUMERIC

| Schema | Tabela | Coluna | Type | Mapper | Status |
|--------|--------|--------|------|--------|--------|
| `core` | `restaurants` | `delivery_fee` | numeric(10,2) | `restaurantMapper.ts:13` | **FIX** |
| `core` | `restaurants` | `rating` | numeric(3,2) | `restaurantMapper.ts:10` | **FIX** |
| `core` | `restaurants` | `latitude` | numeric(10,7) | `restaurantMapper.ts:26` | **FIX** |
| `core` | `restaurants` | `longitude` | numeric(10,7) | `restaurantMapper.ts:27` | **FIX** |
| `core` | `menu_items` | `price` | numeric(10,2) | `restaurantMapper.ts:40` | **FIX** |
| `core` | `menu_items` | `original_price` | numeric(10,2) | `restaurantMapper.ts:44` | **FIX** |
| `core` | `additives` | `price` | numeric(10,2) | `restaurantMapper.ts:49` | **FIX** |
| `core` | `coverage_cities` | `latitude/longitude` | numeric(10,7) | (não exposto via API) | OK |
| `customer` | `addresses` | `latitude/longitude` | numeric(10,7) | `addressMapper.ts:16-17` | **FIX** |
| `customer` | `orders` | `subtotal/delivery_fee/discount/total` | numeric(10,2) | (consumer-order DTO pendente) | **PREPARADO** (coerceNumeric ready) |
| `customer` | `orders.items` | `price` | numeric(10,2) | (idem) | **PREPARADO** |
| `merchant` | `branches` | `latitude/longitude` | numeric(10,7) | `merchantMapper.ts:20-22` | **FIX** |
| `merchant` | `branches` | `delivery_radius_km` | numeric | `merchantMapper.ts:19` | **FIX** |
| `merchant` | `merchant_menu` | `price` | numeric(10,2) | `merchantMapper.ts:27` | **FIX** |
| `merchant` | `merchant_orders` | `total` | numeric(10,2) | `merchantMapper.ts:40` | **FIX** |
| `merchant` | `merchant_orders.items` | `price` | numeric(10,2) | `merchantMapper.ts:42-45` | **FIX** |
| `saas` | `plans` | `monthly_price` | numeric(10,2) | (DTO não exposto ainda) | **PREPARADO** |
| `saas` | `addons` | `monthly_price` | numeric(10,2) | (idem) | **PREPARADO** |
| `saas` | `subscriptions` | `amount` | numeric(10,2) | (idem) | **PREPARADO** |
| `saas` | `commission_plans` | `marketplace/delivery/payment_fee` | numeric(5,2) | (internal, sem DTO) | OK |
| `commerce` | `loyalty` | `points_per_real/discount_value` | numeric | (DTO não exposto) | **PREPARADO** |
| `commerce` | `coupons` | `discount_value/min_order` | numeric(10,2) | (idem) | **PREPARADO** |
| `commerce` | `campaigns` | `discount_percentage` | numeric(5,2) | (idem) | **PREPARADO** |

**Status**:
- **FIX** = DTO exposto + mapper com `coerceNumeric` aplicado
- **PREPARADO** = util `coerceNumeric` disponível; mapper a criar quando DTO for implementado
- **OK** = NUMERIC interno sem exposição ao FE (não precisa coerção)

---

## Backend contract audit

### `server/src/routes/consumer-orders.ts:11-36`
```ts
const result = await db.select({
  ...
  subtotal: orders.subtotal,
  delivery_fee: orders.delivery_fee,
  discount: orders.discount,
  total: orders.total,
  ...
}).from(orders)...
return c.json(result);
```

**Status**: retorna string. **DTO consumer-order completo ainda não existe** (`superadminDto.ts:133-141` é minimal — só `total`). Pendência para task futura: criar `ConsumerOrderDTO` com `subtotal/delivery_fee/discount/total` + `consumerOrderMapper` com `coerceNumeric`. **Mitigação atual**: o util `coerceNumeric` está pronto para uso imediato quando o mapper for criado.

### Outras rotas auditadas
- `server/src/index.ts:133-149` (restaurants) — raw Drizzle, **fix no mapper** ✅
- `server/src/routes/branches.ts` (merchant) — raw Drizzle, **fix no mapper** ✅
- `server/src/routes/orders.ts` — orders DTO + mapper já cobertos indiretamente via `merchantMapper.ts:orderDtoToModel` ✅
- `server/src/routes/companies.ts` — sem campos NUMERIC expostos
- `server/src/routes/operations.ts` — sem campos NUMERIC expostos

---

## Comportamentos dev vs produção

Documentado em [[Dev vs Production - Comportamentos Diferenciados]]. Resumo:

| Comportamento | Dev (localhost) | Dev (LAN IP) | Produção |
|---------------|-----------------|--------------|----------|
| Postgres NUMERIC → string | mascarado por MSW | **visível** (mappers aplicam coerção) | **aplicável** |
| UF format inconsistency | mascarado por MSW (fixture "SP") | **visível** (Nominatim retorna "São Paulo") | **aplicável** |
| localStorage per-origin | **visível** (TTL=0 força refresh) | **visível** (TTL=0) | **não aplicável** (origem única) |
| MSW interception | ativo | depende de cert | **não ativo** |
| Auto-seed Franca | ativo | ativo | **não ativo** |

**Conclusão**: Os fixes de mapper + normalizeStateBR são **obrigatórios para produção**. As mitigações de cache TTL=0 e ajustes MSW são **dev-only**.

---

## Validação final

| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ 0 erros |
| `npx tsc -b` | ✅ exit 0 |
| `npx vitest run` | ✅ **355/355** (31 files, 109.36s) — +58 testes |
| `npm run build` | ✅ built in 22.03s |

**Novos testes (58)**:
- `src/mappers/restaurantMapper.test.ts` — 16 testes (NUMERIC string→number em 7 mappers)
- `src/utils/states.test.ts` — 32 testes (27 UFs, case-insensitive, com/sem acentos, edge cases)
- `src/utils/format.test.ts` — 10 testes (string, number, null, undefined, NaN, Infinity, espaços)

---

## Próximos passos (out of scope)

1. **Criar `ConsumerOrderDTO` completo** + `consumerOrderMapper` com `coerceNumeric` para `subtotal/delivery_fee/discount/total`.
2. **Monitorar divergências de bairro** entre hosts (mesmo após TTL=0 fix).
3. **Considerar** tabelas `device_locations` no backend (LGPD-compliant) se TTL=0 for muito agressivo em dev (múltiplas chamadas Nominatim).
4. **Validar manualmente no mobile** que `deliveryFee` renderiza corretamente após o fix.
5. **Validar manualmente no mobile** que `has-coverage` retorna `true` para Franca após o fix de UF.
