---
title: "ADR-001: ViaCEP como fonte oficial de bairro"
status: approved
date: 2026-06-03
deciders: Architecture Review
consulted: Auditoria Nominatim vs ViaCEP (23 pontos em Franca-SP)
context: |
  Auditoria revelou divergência significativa entre bairros retornados pelo Nominatim
  e os registros oficiais dos Correios (ViaCEP). Apenas ~8,7% de acerto do Nominatim
  contra a base oficial. Caso crítico: CEP 14403-088 onde Nominatim retornou
  "Parque do Castelo" e o bairro real é "Parque Progresso" (confirmado pelo usuário).
decision: |
  Adotar a seguinte priorização para identificação de bairro:
  ViaCEP (fonte oficial) > Nominatim neighbourhood > Nominatim quarter > Nominatim suburb

  O ViaCEP passa a ser a fonte oficial para exibição de bairro ao usuário.
  O bairro original do Nominatim/Photon deve ser preservado internamente para
  fins de auditoria e métricas de divergência.
consequences:
  - Alterar ReverseGeocodeResult para incluir postcode
  - Extrair postcode dos providers Nominatim e Photon
  - Criar viacepEnricher.ts para consultar ViaCEP e enriquecer o resultado
  - Preservar neighborhood original em campo separado (originalNeighborhood)
  - Registrar métricas de divergência entre ViaCEP e Nominatim
  - Cache v3 → v4 com flag viacepChecked
  - Fallback silencioso se ViaCEP falhar
recorded_by: "Sessão de revisão arquitetural"
related:
  - "MEMORY.md"
  - "src/providers/geocoding/IGeocodingProvider.ts"
  - "src/services/geocoding/neighborhoodCorrections.ts"
  - "src/api/viaCepApi.ts"
  - "src/services/geocoding/GeocodingService.ts"
tags:
  - type/adr
  - domain/geocoding
  - domain/location
  - status/approved
---
