---
title: ADR-003 Cobertura derivada de restaurants ativos com geofencing-ready
aliases:
  - ADR-003 Cobertura
  - ADR-003 Geofencing Ready
tags:
  - type/adr
  - domain/core
  - layer/L2
  - status/active
  - tech/drizzle
  - tech/postgres
  - domain/coverage
created_at: 2026-06-05
updated_at: 2026-06-05
related:
  - "[[ADR-002 Proveniancia e Confidence de Coordenadas]]"
  - "[[ADR-001 ViaCEP como fonte oficial de bairro]]"
  - "[[MOC Architecture]]"
  - "[[MOC Delivery Flow]]"
  - "[[MOC Database]]"
supersedes: []
---

# ADR-003 — Cobertura derivada de restaurants ativos (geofencing-ready)

## Status

✅ Aprovado em 2026-06-05 (Fase 28 — continuação da [[ADR-002]])

## Contexto

O modelo anterior (`mockCoverageCities` → tabela `coverage_cities`) operava como **whitelist administrativa** de cidades onde a plataforma estava "aberta". Esse modelo:

- **Duplicava a fonte de verdade**: a "cidade atendida" era decidida em `coverage_cities.is_active`, mas a entrega real depende dos restaurants existentes.
- **Quebrou a UX para Franca**: 8 restaurants ativos em `mockRestaurants` não apareciam na home porque `mockCoverageCities` (frontend MSW) listava apenas 3 cidades (SP, RJ, BH).
- **Era incompatível com geofencing**: o modelo era "tudo ou nada" por cidade, sem noção de bairro, raio ou polígono.
- **Misturava papéis**: `coverage_cities` misturava dado técnico (lat/lng) com decisão comercial (ativar/desativar cidade).

## Decisão

A **fonte de verdade única** para cobertura passa a ser `restaurants` (cadastro de merchants), com três níveis de granularidade, do mais simples ao mais preciso:

1. **Cidade** — string match em `restaurants.city`. Default atual.
2. **Bairro (neighborhood)** — string match em `restaurants.neighborhood` dentro de uma cidade.
3. **Raio / polígono** — distância haversine em `restaurants.latitude`/`longitude` ou polígono JSONB em `restaurants.coverage_polygon`. **Stub na Fase 28.1, ativado em fase futura sem quebra arquitetural**.

### Modelo de dados (Fase 28.1)

Novas colunas em `restaurants` (migration `0011_add_restaurant_coverage`):

| Coluna | Tipo | Default | Semântica |
|--------|------|---------|-----------|
| `is_active` | `boolean NOT NULL` | `true` | Toggle operacional — restaurant visível ou não |
| `delivery_radius_km` | `integer` | `8` | Raio de entrega a partir do `latitude`/`longitude` (alinhado com `branches.delivery_radius_km`) |
| `coverage_zone_type` | `enum('city','neighborhood','polygon','radius')` | `'city'` | Estratégia de cobertura |
| `coverage_polygon` | `jsonb` (nullable) | `null` | Polígono GeoJSON (Fase futura) |

Novos índices:

- `idx_restaurants_city_active` em `(city, is_active)` — listagem de cidades
- `idx_restaurants_neighborhood_active` em `(city, neighborhood, is_active)` — listagem de bairros
- `idx_restaurants_geo` em `(latitude, longitude)` WHERE `is_active = true` — geofencing via raio

### Semântica de "cidade atendida"

```sql
-- Cidade atendida = ≥1 restaurant ativo na cidade
SELECT COUNT(*) > 0
FROM restaurants
WHERE is_active = true
  AND city = $1
  AND state = $2;
```

Mesma lógica para bairro:

```sql
-- Bairro atendido = ≥1 restaurant ativo no bairro
SELECT COUNT(*) > 0
FROM restaurants
WHERE is_active = true
  AND city = $1
  AND state = $2
  AND neighborhood = $3;
```

### Evolução para geofencing (Fase futura, **sem quebra**)

O enum `coverage_zone_type` define qual estratégia cada restaurant usa. Um único restaurant pode estar em múltiplas zonas (cidade + bairro) através de um array em fase futura.

**Fase 28.x+ (geofencing)**:

```sql
-- Cobertura por raio (haversine)
SELECT *
FROM restaurants
WHERE is_active = true
  AND coverage_zone_type = 'radius'
  AND ST_DWithin(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint($1, $2)::geography,
    delivery_radius_km * 1000
  );
```

```sql
-- Cobertura por polígono (PostGIS)
SELECT *
FROM restaurants
WHERE is_active = true
  AND coverage_zone_type = 'polygon'
  AND ST_Contains(
    coverage_polygon::geometry,
    ST_MakePoint($1, $2)
  );
```

**Sem migração de schema** — apenas ativação de `coverage_zone_type` por restaurant + extensão PostGIS opcional. A coluna `coverage_polygon` (jsonb) já existe.

## Alternativas Consideradas

| Alternativa | Por que rejeitada |
|-------------|-------------------|
| Manter `coverage_cities` como whitelist + adicionar bairro separado | Duplica fonte de verdade; mais tabelas para sincronizar |
| Usar PostGIS desde o início | Complexidade operacional alta para o estado atual; 8 restaurants em Franca não justificam |
| Adicionar `is_available` em `restaurants` (snake_case) | Inconsistente com `categories.is_active` e `companies.is_active`; adota-se `is_active` |
| Manter `coverage_cities` como "política" + `restaurants` como "dado" | Separação não é real — cidades sem restaurant = cidade morta; acoplar é correto |
| Tabela `restaurant_coverage_zones` separada | Overhead; 1:N + JOIN para um caso simples; `coverage_zone_type` resolve |

## Consequências

### Positivas

- **Franca volta a funcionar** — 8 restaurants aparecem na home com `is_active=true` (default da migration).
- **Geofencing-ready** — polígono/radio podem ser ativados sem nova migração de schema.
- **Toggle por restaurant** — admin/merchant liga/desliga um restaurant sem mexer em cidade.
- **Performance** — índices compostos em `(city, is_active)` e `(city, neighborhood, is_active)` mantêm queries O(log n).
- **Consistência com `categories` e `companies`** — mesmo padrão `is_active: boolean default true`.

### Negativas

- **Migração breaking** — endpoints `GET /api/coverage-cities` removidos em Fase 28.4.
- **PostGIS é opcional** — geofencing complexo exige extensão; não habilitada por padrão.
- **`is_available` em `MenuItem` permanece** — semântica diferente ("produto disponível agora") vs `is_active` em `Restaurant` ("loja aberta"). Coexistência intencional.
- **Dados de Franca sem `state`/`neighborhood`/`lat`/`lng`** — migration preenche defaults, fixtures serão atualizadas na Fase 28.1.

## Implementação

- **Fase 28.1**: schema + migration + DTO + types + fixtures + repository filter `is_active=true`
- **Fase 28.2**: novos endpoints (`GET /api/cities/active`, `GET /api/neighborhoods/active?city=`, `PUT /api/restaurants/:id/availability`)
- **Fase 28.3**: hooks + components + `AdminRestaurantsPage` com toggle `isActive`
- **Fase 28.4**: remover `coverage_cities` table + endpoints + mocks + `AdminCoveragePage`
- **Fase 28.5**: docs + ADR esta entrada
- **Fase futura**: PostGIS + `coverage_polygon` para geofencing real

## Compliance

- ✅ ADR-001: ViaCEP continua sendo a fonte oficial de bairro (preenchimento automático no onboarding de restaurant)
- ✅ ADR-002: `coord_confidence` aplica-se a coordenada do usuário; cobertura é independente (a coordenada do restaurant vem de `restaurants.latitude/longitude`, validada por admin)
- ✅ Skill `geolocation-system-governance`: Seção 12 (cobertura) — substitui Seção 12.2.3 (whitelist) por Seção 12.4 (derivar de restaurants ativos)

## Referências

- [[ADR-002 Proveniancia e Confidence de Coordenadas]]
- [[ADR-001 ViaCEP como fonte oficial de bairro]]
- [[MOC Delivery Flow]]
- [[MOC Database]]
- Drizzle ORM docs: https://orm.drizzle.team/docs/column-types/pg
- PostGIS ST_DWithin: https://postgis.net/docs/ST_DWithin.html
