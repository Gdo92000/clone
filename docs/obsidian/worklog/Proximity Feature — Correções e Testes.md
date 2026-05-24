---
type: worklog
status: concluded
created_at: 2026-05-23
updated_at: 2026-05-23
related:
  - docs/obsidian/worklog/Proximidade e Geocodificação
  - server/src/services/coverageCityService.ts
tags:
 - type/worklog
---

# Proximity Feature — Correções e Testes

## Seed bug (corrigido)

**Arquivo:** `server/src/services/coverageCityService.ts`

`seedFromRestaurants()` anteriormente inseria `latitude: '0', longitude: '0'` para todas as cidades, o que quebrava o cálculo de distância no frontend.

**Correção:** agora a função seleciona `latitude` e `longitude` de cada restaurante, agrupa por cidade, e computa a média das coordenadas como centróide da cidade. Quando não há coordenadas disponíveis, usa fallback para `-23.5, -46.6` (centro aproximado do estado de SP).

## Testes adicionados

### Backend

| Arquivo | O que cobre |
|---------|-------------|
| `server/src/routes/routes.test.ts` | GET / (empty), GET /:id (found + 404), POST /admin (create + 400), PUT /admin/:id (update + 404), PATCH /admin/:id/toggle, DELETE /admin/:id, POST /admin/seed |

### Frontend

| Arquivo | Testes | O que cobre |
|---------|--------|-------------|
| `src/services/locationService.test.ts` | 8 | `calculateDistance` (Haversine: mesmo ponto, SP→RJ, SP→BH, curta distância, coordenadas internacionais), `formatDistance` (km, metros, arredondamento) |
| `src/services/cityCoverageService.test.ts` | 13 | `normalizeCityName` (lowercase, acentos, trim, já normalizado), `isSameCityName` (igual, acentos diferentes, case diferente, cidades diferentes), `getRegisteredCityCoverages` (API retorna dados), `findRegisteredCityCoverage` (match exato, match accent-insensitive, não encontrado, erro de API) |

## Resultados de validação

- `tsc -b --noEmit`: ✅ 0 erros
- `vitest run`: ✅ 242 testes (17 suítes)
- `vite build`: ✅ limpo

## Arquivos alterados/criados

```
M server/src/services/coverageCityService.ts   (fix seed lat/lng)
M server/src/routes/routes.test.ts              (+11 coverage city tests)
A src/services/locationService.test.ts          (8 tests)
A src/services/cityCoverageService.test.ts      (13 tests)
M docs/sources/MEMORY.md                        (snapshot atualizado)
```

## Status da feature de proximidade

A funcionalidade completa (CityRestaurantsPage + useLiveCityEstablishments + LocationContext + geolocation + Nominatim + city coverage) permanece implementada e sem alterações. Este trabalho focou exclusivamente em:

1. Corrigir bug no seed de coordenadas
2. Adicionar cobertura de testes para o backend e frontend
3. Validar todo o pipeline (tsc, build, tests)

**Próximo passo sugerido:** testar o fluxo real com Geolocation + Nominatim em browser, e verificar se `GET /api/coverage-cities` está populado na base Postgres.

> [!tip] Navegação
> [[MOC — Histórico do Projeto]] · [[Proximidade e Geocodificação]]
