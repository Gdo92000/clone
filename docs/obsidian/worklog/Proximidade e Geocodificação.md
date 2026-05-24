---
type: worklog
status: concluded
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
 - type/worklog
---

# Proximidade e Geocodificação — Busca por Cidade

## Problema resolvido (contexto.txt)
Sem API key de geocodificação paga; funciona em desktop e mobile; proteção em duas camadas por cidade:  
1. cidade ∈ cidades registadas no banco → busca de restaurantes  
2. cidade ∉ cidades registadas → bloquear, mostrar mensagem "Cidade não atendida"

## Fluxo de busca de proximidade
```
1. Geolocation.getCurrentPosition()
   → { latitude, longitude } do dispositivo

2. Nominatim (OpenStreetMap) reverse-geocode
   → { city: 'São Paulo', state: 'SP', country: 'Brasil' }

3. cityCoverageService.findRegisteredCityCoverage(city)
   → (single truth) busca EM MEMÓRIA ou BANCO as cidades registadas
   → retorna a cidade cobertura correspondente || null

4. city É registered?
   SIM: buscar restaurantes dentro de radius_km do centro da cidade
   NÃO: exibir "Cidade não atendida" — NÃO consome API

5. Busca de restaurantes pode usar:
   a) Base global: { latitude, longitude } do centro da cidade
   b) Haversine: calcula distância em km de cada restaurante vs usuário
```

## Arquivos envolvidos
```
src/services/locationService.ts           — Geolocation API + Nominatim fetch
src/services/cityCoverageService.ts       — single truth: findRegisteredCityCoverage()
shared/validations/coverageCity.ts        — Zod schema compartilhado (cidades)
server/src/services/coverageCityService.ts—— Service backend que lê do registry
server/src/db/repositories/memory/memory-coverage-cities.ts — repositório memória cidades
```

## Proteção de cidade — duas camadas

### Camada 1 — Coleta
`useLiveCityEstablishments` → `locationService.getUserPosition()`
→ Nominatim reverse-geocode → `{ city }`

### Camada 2 — Validação
`cityCoverageService.findRegisteredCityCoverage(city)` → retorna cidade cobertura ou `null`  
Se `null` → bloqueia busca, não chamar API de restaurantes

## Endpoint de cidades de cobertura
```
GET /api/coverage-cities
→ { id, name, state, latitude, longitude, radius_km, restaurant_count, is_active }
Schema: shared/validations/coverageCity.ts — coverageCityListResponseSchema
```

> [!tip] Navegação
> [[MOC — Histórico do Projeto]] · [[Proximity Feature — Correções e Testes]]
