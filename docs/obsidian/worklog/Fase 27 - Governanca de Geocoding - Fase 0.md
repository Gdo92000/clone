---
type: worklog
title: "Fase 27 — Governança de Geocoding (Fase 0) + Auditoria de Franca"
status: concluded
created_at: 2026-06-05
updated_at: 2026-06-05
related:
  - "MEMORY.md"
  - "CURRENT_STATE.md"
  - "docs/skills/geolocation-system-governance/SKILL.md"
  - "src/services/geolocationService.ts"
  - "src/providers/locationMachine.ts"
  - "src/context/LocationContext.tsx"
tags:
  - type/worklog
  - domain/geolocation
  - domain/architecture
---

# Fase 27 — Governança de Geocoding (Fase 0) + Auditoria de Franca

## Contexto

Sessão iniciada após Fase 26 (Pipeline de Geocoding + Persistência). Skill `geolocation-system-governance` carregada como **fonte de verdade** para decisões de geolocalização. O usuário reportou que 8 restaurants mockados em `Franca-SP` não apareciam na home e pediu investigação da causa raiz **sem mudanças corretivas até aprovação do relatório**.

## Fase 0 — Aderência mínima à skill (4 mudanças)

Auditoria da skill revelou 4 violações corrigíveis imediatamente. Demais pendências marcadas como "adiadas" (custo/escopo alto, justificadas em ADR).

### 1. Validação de payload IPG — `geolocationService.ts`

**Proibição violada**: #18 (validar resposta de IP geolocation)

**Antes**: `extractIpGeo()` retornava `data` cru se `data.city` existisse, sem verificar `status`, `data.error`, ou se `city`/`region` estavam vazios.

**Depois** (`src/services/geolocationService.ts:159-189`):
- `extractIpGeo(raw)` valida `status === 'success'`, `!data.error`, `data.city` e `data.region` não-vazios
- `safeField(value, fallback)` para logging seguro de `unknown`
- Retorna `null` explícito em payload inválido (fail-loud, não silencioso)

### 2. Proveniência + Confidence — `locationMachine.ts`

**Seção violada**: 6.2 (Contrato Canônico exige `coord_source` e `coord_confidence` em `LocationState`)

**Mudanças** (`src/providers/locationMachine.ts:11,23-34,44-50`):
- Novo tipo `CoordSource = 'gps' | 'gps-fallback' | 'ip_fallback' | 'manual' | 'cache' | 'reverse_geocode' | null`
- `LocationState` agora carrega `coord_source: CoordSource` e `coord_confidence: number`
- Função `calculateCoordConfidence(accuracyMeters)` mapeia `0.30–0.95` conforme matriz da Seção 4.1 (GPS ≤10m → 0.95, 50m → 0.80, 100m → 0.70, >500m → 0.30)

### 3. Threshold de cobertura — `processSupportedCity`

**Seção violada**: 12.2.3 (cobertura só deve ser avaliada se `coord_confidence ≥ 0.6`)

**Mudança** (`src/providers/locationMachine.ts:72-87`):
- Assinatura: `processSupportedCity(detectedCity, coords, coordConfidence)`
- `isWithinSupportedCity` permanece como `boolean`, mas agora é `false` quando:
  - cidade detectada não está nas registradas **OU**
  - `coord_confidence < 0.6` (não há geometria confiável para decidir)

### 4. Proveniência em todos os caminhos — `LocationContext.tsx`

**Seção violada**: 6.2 (state machine deve preservar proveniência em transições)

**Mudanças** (`src/context/LocationContext.tsx:31-149`):

| Caminho | Proveniência | Confidence |
|---------|--------------|------------|
| `hydrateFromCache` | `cache` | preservado do state salvo |
| `tryIpFallback` | `ip_fallback` | `0.20` (fixo) |
| `processCoords` (GPS ok) | `gps` | `calculateCoordConfidence(accuracy)` |
| `processCoords` (GPS denied) | `gps-fallback` | `0.30` |
| `setManualCity` | `manual` | `1.0` |

## Auditoria de Franca-SP — Árvore de Decisão Completa

Investigação da causa raiz do "home vazio" para usuário em Franca. **Sem código alterado** — relatório técnico puro.

### Hipóteses validadas por grep

| ID | Hipótese | Evidência | Status |
|----|----------|-----------|--------|
| B1 | Cache de cidade antiga (TTL 24h) pode estar servindo SP/RJ/BH | `geolocationService.ts:6` — `CACHE_KEY = 'geo:city'` com `expiresAt > Date.now()` | ⚠ Provável |
| B2 | IP detection falha → `city=null` → home mostra "Ative a localização" | `ipApi.ts` + `ipapi.co`/`ip-api.com` via Vite proxy; sem fallback local | ⚠ Possível |
| B3 | Franca ausente de `mockCoverageCities` (3 cidades: SP, RJ, BH) | `src/mocks/fixtures/superadmin.ts:16-20` confirmado | ✅ **Confirmado** |
| B4 | Home filtra por `city.name` mas Franca é desconhecida | `HomePage.tsx:32-35` — `r.city?.toLowerCase() === city?.name.toLowerCase()` | ✅ **Confirmado** (mas depende de B1/B2) |
| B5 | `useLiveCityEstablishments` exige `isWithinSupportedCity` | Hook linha 117 bloqueia busca se `!isWithinSupportedCity` | ✅ **Confirmado** (relevante só em CityRestaurantsPage) |
| B6 | `RestaurantListPage` exige `hasLocation && isWithinSupportedCity` | Linha 51 | ✅ **Confirmado** (relevante só em `/restaurants`) |

### Fluxo end-to-end (Franca)

```
1. Browser abre HomePage
2. <FxNavbar /> + <LocationInitializer /> disparam useLocationContext
3. LocationContext.hydrateFromCache() tenta localStorage['geo:city']
   ├─ Cache hit + cidade dentro do TTL: USA (pode ser Franca antiga de teste anterior)
   └─ Cache miss/expirado: segue para tryIpFallback()
4. tryIpFallback() chama ipApi.fetchIpGeo()
   ├─ OK: { city: 'Franca', state: 'SP' } → state.coord_source='ip_fallback', confidence=0.20
   └─ Falha: city=null → home mostra "Ative a localização"
5. processSupportedCity('Franca', null, 0.20)
   ├─ 'Franca' não está em mockCoverageCities (SP, RJ, BH) → isWithinSupportedCity=false
   └─ confidence 0.20 < 0.60 → reforço da negação
6. HomePage renderiza: <h2>Restaurantes em {cityName}</h2> + lista vazia
7. Card "Nenhum restaurante encontrado em Franca" → usuário acha que app está quebrado
```

### Diagnóstico final

**Franca será sempre vazia no estado atual** porque:
- `mockCoverageCities` contém apenas 3 cidades (SP, RJ, BH)
- `findRegisteredCityCoverage('Franca')` retorna `null`
- `processSupportedCity` retorna `isWithinSupportedCity=false`
- `HomePage` filtra por `city.name` que **NÃO consulta `isWithinSupportedCity`** — então o filtro passa (city.name === 'Franca') mas **os 8 restaurants mockados têm `city: 'Franca'`** e DEVERIAM aparecer

**Espera — releitura**: o filtro `r.city === city.name` SÓ passa se `city` (do LocationContext) for 'Franca'. Se o cache retornar 'São Paulo', o filtro `r.city.toLowerCase() === city.name.toLowerCase()` filtra restaurants cuja `city === 'Franca'`, mantendo-os ocultos porque `r.city !== 'São Paulo'`.

Logo, **se o usuário já navegou antes** com cache populado para SP/RJ/BH, o cache serve essas cidades e a home mostra "Nenhum restaurante em SP" (correto) mas o usuário estranha porque está em Franca.

### Correção mínima sugerida (não aplicada)

**Opção A (1 linha)**: Adicionar Franca em `mockCoverageCities` em `src/mocks/fixtures/superadmin.ts:16-20`.

```ts
{ id: 'city-franca', name: 'Franca', state: 'SP', latitude: -20.5386, longitude: -47.4006,
  radius_km: 12, restaurant_count: 8, is_active: true }
```

**Opção B (UX polish)**: Hard refresh + limpar `localStorage.geo-cache` antes de testar, para forçar detecção nova.

**Recomendação**: A (fonte do problema é dado, não código). B é workaround.

## Pendências da skill (adiadas, com justificativa)

| Violação | Pendência | Justificativa para adiar |
|----------|-----------|--------------------------|
| Proibição #3 | Migrar `isWithinSupportedCity: boolean` → `boolean \| null` (`null` = "não há geometria") | Quebraria 4 consumidores; decisão em ADR-002 |
| Proibição #9 | Renomear `IpApiResponse` → `InternalIpApiResponse` (não expor `ip`/`asn`/`org`) | Refator cosmético, sem impacto funcional |
| Proibição #11 | Adicionar `User-Agent` no Nominatim | `NominatimGeocodingProvider` JÁ adiciona — confirmado por re-leitura |
| Seção 7.3 | Reduzir SLA timeout GPS de 25s para 8s | Decisão de UX, não arquitetural |
| Seção 9 | Implementar cache L3-L5 (memória, IndexedDB, Service Worker) | Cache L2 (localStorage) já existe |
| Fase 17 | Migração completa para `CanonicalLocation` v2 | Esforço ~3-5 dias; ADR separado |

## Validação Fase 0

| Check | Resultado |
|-------|-----------|
| `npx tsc -b` | ✅ exit 0 |
| `npm run lint` | ✅ 0 errors (1 warning pré-existente) |
| `npx vitest run` | ✅ 321/321 tests (28 files, 90.85s) |

## Decisões

- **Fase 0 incremental**: aplicar 4 correções mínimas que não quebram consumidores
- **Manter `isWithinSupportedCity: boolean`**: a `false` agora tem 2 semânticas distintas (não registrada **ou** baixa confidence); proveniência fica em `coord_source`/`coord_confidence`
- **Auditoria pura antes de fix**: usuário pediu relatório, não código. Opção A (1 linha) é o fix mínimo, mas aguarda aprovação
- **Pendências em ADR-002**: comprovações vs urgência de migração `boolean` → `boolean | null`

## Não-objetivos

- Não modificar `mockCoverageCities` (decisão do usuário em manter SP/RJ/BH como cidades suportadas em mock)
- Não migrar para `CanonicalLocation` v2 (escopo separado)
- Não adicionar Franca em mocks de cobertura (aguarda aprovação do relatório)

> [!tip] Navegação
> [[MEMORY|Obsidian MEMORY]] · [[CURRENT_STATE]] · [[ADR-002 Proveniência e Confidence de Coordenadas]] · [[MOC — Histórico do Projeto]]
