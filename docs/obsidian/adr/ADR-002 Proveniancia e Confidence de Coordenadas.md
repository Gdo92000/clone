---
title: "ADR-002: Proveniência e Confidence de Coordenadas Geográficas"
status: approved
date: 2026-06-05
deciders: Sessão de governança de geocoding
consulted: Skill `geolocation-system-governance` (Seções 4.1, 6.2, 12.2.3)
context: |
  Auditoria contra a skill `geolocation-system-governance` revelou que o `LocationState`
  não carrega proveniência (`coord_source`) nem nível de confidence da coordenada
  (`coord_confidence`). Sem esses metadados, o sistema não consegue distinguir uma
  cidade detectada por GPS (alta confiança) de uma detectada por IP (baixa confiança),
  o que leva a falsos positivos em validação de cobertura (uma cidade "suportada"
  pode estar a 50km do centro real, com 100m de erro de GPS).
decision: |
  Adicionar `coord_source: CoordSource` e `coord_confidence: number` ao `LocationState`.

  `CoordSource = 'gps' | 'gps-fallback' | 'ip_fallback' | 'manual' | 'cache' | 'reverse_geocode' | null`

  `calculateCoordConfidence(accuracyMeters)` mapeia conforme matriz:
  - GPS accuracy ≤ 10m → 0.95
  - GPS accuracy 50m → 0.80
  - GPS accuracy 100m → 0.70
  - GPS accuracy > 500m → 0.30
  - IP fallback → 0.20 (fixo, sem geometria)
  - Manual (usuário digitou) → 1.0
  - Cache → preservado do state salvo

  `processSupportedCity` exige `coord_confidence ≥ 0.6` para retornar
  `isWithinSupportedCity: true`. Abaixo desse threshold, retorna `false`
  (a proveniência fica preservada nos campos `coord_source`/`coord_confidence`
  para que a UI possa exibir "Localização aproximada por IP" etc.)
consequences:
  - LocationState agora tem 2 campos novos (não-breaking para consumidores)
  - LocationContext.tsx seta proveniência em todos os 4 caminhos (cache, IP, GPS, manual)
  - locationMachine.ts exporta `calculateCoordConfidence` para testes
  - UI ganha informação suficiente para mensagens contextuais (Fase 27.5)
  - Migração futura para `CanonicalLocation` v2 preservará esses 2 campos
related:
  - "MEMORY.md"
  - "CURRENT_STATE.md"
  - "docs/skills/geolocation-system-governance/SKILL.md"
  - "src/providers/locationMachine.ts"
  - "src/context/LocationContext.tsx"
  - "src/services/geolocationService.ts"
  - "Fase 27 - Governanca de Geocoding - Fase 0"
tags:
  - type/adr
  - domain/geolocation
  - status/approved
---
