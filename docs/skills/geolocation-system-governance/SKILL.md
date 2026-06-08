---
type: skill
status: active
domain: domain/core
layer: layer/L1
moc: MOC Architecture
semantic_priority: 5
tags:
  - type/skill
  - type/architecture
  - domain/core
  - domain/geo
  - domain/location
  - domain/observability
aliases:
  - Geolocation Governance
  - Geo Governance
  - Location Canonical Contract
  - Geo Skill
created_at: 2026-06-05
updated_at: 2026-06-05
related:
  - "[[MOC Architecture]]"
  - "[[MOC Delivery Flow]]"
  - "[[MOC Database]]"
  - "[[MOC Merchant]]"
  - "[[MOC Courier]]"
  - "[[MOC SaaS]]"
  - "[[MOC RAG]]"
supersedes: []
---

# Geolocation System Governance

> **Status:** Especificação arquitetural — fase de design, pré-implementação.
> **Escopo:** Padrão oficial de geolocalização do projeto Flux Delivery.
> **Audiência:** Engenheiros de frontend, backend, dados, DevOps, produto e auditoria.

---

## Índice

1. [Objetivo e Escopo](#1-objetivo-e-escopo)
2. [Fontes de Dados Suportadas](#2-fontes-de-dados-suportadas)
3. [Hierarquia Oficial de Fontes de Verdade](#3-hierarquia-oficial-de-fontes-de-verdade)
4. [Matriz de Confiança por Provedor](#4-matriz-de-confiança-por-provedor)
5. [Regras de Resolução de Conflitos](#5-regras-de-resolução-de-conflitos)
6. [Contrato Canônico de Localização](#6-contrato-canônico-de-localização)
7. [Pipeline Oficial de Geolocalização](#7-pipeline-oficial-de-geolocalização)
8. [Regras de Normalização](#8-regras-de-normalização)
9. [Estratégia de Cache](#9-estratégia-de-cache)
10. [Estratégia de Retry e Fallback](#10-estratégia-de-retry-e-fallback)
11. [Estratégia de Observabilidade](#11-estratégia-de-observabilidade)
12. [Estratégia de Cobertura de Entrega](#12-estratégia-de-cobertura-de-entrega)
13. [Regras Proibidas](#13-regras-proibidas)
14. [Critérios de Aceitação](#14-critérios-de-aceitação)
15. [Casos Especiais](#15-casos-especiais)
16. [Impactos Arquiteturais](#16-impactos-arquiteturais)
17. [Plano de Migração](#17-plano-de-migração)

---

## 1. Objetivo e Escopo

### 1.1. Propósito

Esta skill define o **padrão canônico de geolocalização** do projeto Flux Delivery. Ela é a **fonte única de verdade** para qualquer decisão que envolva:

- Captura, armazenamento e exibição de localizações.
- Resolução de endereços, CEPs e coordenadas geográficas.
- Determinação de cobertura de entrega.
- Geofencing de merchants, couriers e zonas operacionais.
- Auditoria de divergências entre provedores.

> Toda decisão de negócio que dependa de localização **deve** ser precedida pela leitura desta skill.

### 1.2. Escopo

**Dentro do escopo:**

- Especificação de provedores (Browser Geolocation, OpenStreetMap, Nominatim, Photon, ViaCEP, IP Geolocation).
- Hierarquia de autoridade entre provedores.
- Contrato canônico (shape, obrigatoriedade, semântica) de localização.
- Pipeline de captura, enriquecimento, validação, normalização e persistência.
- Resolução de conflitos entre provedores.
- Estratégia de cobertura de entrega (polígonos, raio, geofencing).
- Regras proibidas, observabilidade e migração.

**Fora do escopo:**

- Implementação concreta em código (cobrança da skill `clean-code` + `nodejs-best-practices`).
- Tuning de performance específico de banco de dados.
- UX visual de mapas no front.
- Questões legais e fiscais específicas de jurisdição.

### 1.3. Princípios Fundamentais

| Princípio | Descrição |
|-----------|-----------|
| **Single Source of Truth (SSOT)** | Toda localização passa pelo contrato canônico desta skill. |
| **Defense in Depth** | Nenhum provedor é autoridade absoluta; sempre há redundância e validação. |
| **Proveniência Rastreável** | Todo campo de localização registra o provedor de origem e a confiança. |
| **Privacy by Default** | Coleta mínima. IP e GPS são sinais, nunca identidade. |
| **Fail-Open Auditável** | Falha não é silenciosa; é registrada e classificada. |
| **Reversibilidade** | Migração para um novo provedor é possível sem retrabalho de dados. |

---

## 2. Fontes de Dados Suportadas

### 2.1. Visão geral

| ID | Fonte | Tipo | Cobre | Não cobre |
|----|-------|------|-------|-----------|
| `GPS` | Browser Geolocation | Sinal do dispositivo | Coordenadas, precisão, heading, speed | Endereço, CEP, bairro |
| `OSM` | OpenStreetMap (dados) | Base cartográfica aberta | Dados primários consumidos por Nominatim/Photon | Geocoding direto (depende de serviço) |
| `NOM` | Nominatim | Geocoder oficial OSM | Forward, reverse, structured query, address details | Rate limit rígido (1 req/s) |
| `PHO` | Photon (Komoot) | Geocoder alternativo OSM | Forward, reverse, structured, OSM-tag filter, layer filter | SLA comercial |
| `CEP` | ViaCEP | Autoridade de CEP brasileiro | CEP → endereço oficial (logradouro, bairro, cidade, UF, IBGE) | Geometria, pontos |
| `IPG` | IP Geolocation | Sinal de rede | País, região, cidade, lat/lon aproximada, ISP, ASN | Endereço, bairro, CEP, ponto exato |

### 2.2. Especificação por fonte

#### 2.2.1. Browser Geolocation (`GPS`)

- **API:** `navigator.geolocation` (MDN — `Geolocation`).
- **Métodos:** `getCurrentPosition`, `watchPosition`, `clearWatch`.
- **Saída (`GeolocationPosition`):**
  - `coords.latitude` (graus decimais, WGS84)
  - `coords.longitude` (graus decimais, WGS84)
  - `coords.accuracy` (metros)
  - `coords.altitude` / `coords.altitudeAccuracy` (quando disponível)
  - `coords.heading` / `coords.speed` (em movimento)
  - `timestamp` (epoch ms)
- **Opções:** `enableHighAccuracy`, `timeout`, `maximumAge`.
- **Erros canônicos:** `PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`, `UNKNOWN_ERROR`.
- **Restrições:** exige contexto seguro (HTTPS) e permissão do usuário.
- **Observação operacional:** `accuracy` é o campo mais crítico; valores > 100m em zona urbana devem ser tratados como suspeitos.

#### 2.2.2. OpenStreetMap (`OSM`)

- **Papel:** Base cartográfica canônica, fonte dos dados consumidos por `NOM` e `PHO`.
- **Licença:** ODbL 1.0 — atribuição obrigatória a "OpenStreetMap contributors".
- **Atributos derivados de interesse:** `addr:street`, `addr:housenumber`, `addr:city`, `addr:state`, `addr:postcode`, `addr:suburb`, `addr:neighbourhood`, `place`, `boundary`.
- **Não é consumido diretamente pelo app**; é fonte primária para os geocoders.

#### 2.2.3. Nominatim (`NOM`)

- **Endpoint oficial:** `https://nominatim.openstreetmap.org`.
- **Endpoints relevantes:**
  - `GET /search` — forward; suporta `q=`, `street=`, `city=`, `state=`, `postalcode=`, `country=`, `format=`, `addressdetails=`, `limit=`, `viewbox=`, `bounded=`, `countrycodes=`.
  - `GET /reverse` — reverse; `lat`, `lon`, `format=`, `zoom=`, `addressdetails=`, `extratags=`, `namedetails=`.
  - `GET /lookup` — `osm_ids=`.
- **Saída (`jsonv2`):** `place_id`, `osm_type`, `osm_id`, `boundingbox`, `lat`, `lon`, `display_name`, `class`, `type`, `importance`, `addresstype`, `name`, `address` (subobjeto: `road`, `neighbourhood`, `suburb`, `city`, `town`, `village`, `county`, `state`, `postcode`, `country`, `country_code`).
- **Limites e políticas:**
  - **1 request/segundo** por User-Agent (regra da `Usage Policy`).
  - `User-Agent` identificando o app é obrigatório.
  - **Sem HTTPS obrigatório** (a instância oficial aceita HTTP e HTTPS; preferir HTTPS).
  - **Sem chave de API**; uso comercial requer instância self-hosted.
  - **License header** `Data © OpenStreetMap contributors, ODbL 1.0` deve ser exibido em qualquer lugar que o app mostre mapa derivado.
- **Atributo de ranking:** `importance` ∈ [0, 1] (heurística de relevância). `rank_address` (0–30) para granularidade.

#### 2.2.4. Photon (`PHO`)

- **Endpoint público:** `https://photon.komoot.io` (compatível com self-host).
- **Endpoints relevantes:**
  - `GET /api` — forward; `q=`, `lat=`, `lon=`, `zoom=`, `location_bias_scale=`, `bbox=`, `countrycode=`, `limit=`, `lang=`, `layer=`, `osm_tag=`.
  - `GET /reverse` — reverse; `lon=`, `lat=`, `osm_tag=`, `limit=`.
  - `GET /structured` — `countrycode=`, `state=`, `county=`, `city=`, `postcode=`, `district=`, `housenumber=`, `street=`, `q=`.
- **Saída (GeoJSON `FeatureCollection`):**
  - `features[].properties`: `osm_id`, `osm_type`, `osm_key`, `osm_value`, `name`, `country`, `countrycode`, `state`, `county`, `city`, `postcode`, `district`, `street`, `housenumber`, `type`, `extent`.
  - `features[].geometry`: `Point` `[lon, lat]`.
- **Camadas (`layer`):** `house`, `street`, `locality`, `district`, `city`, `county`, `state`, `country`, `other`.
- **Filtros OSM:** `osm_tag=key:value` (include), `!key:value` (exclude), `key`, `:value`, `!key`, `:!value`.
- **Limitação importante:** Photon **não retorna** o `display_name` consolidado; saída em GeoJSON, exige normalização cliente-side.

#### 2.2.5. ViaCEP (`CEP`)

- **Endpoint:** `https://viacep.com.br/ws/{CEP}/json/`.
- **Entrada:** CEP com 8 dígitos, sem máscara (ex.: `01001000`).
- **Saída:**
  - `cep`, `logradouro`, `complemento`, `unidade`, `bairro`, `localidade`, `uf`, `estado`, `regiao`, `ibge`, `gia`, `ddd`, `siafi`.
- **Erros:**
  - CEP inválido (formato): `HTTP 400`.
  - CEP válido mas inexistente: `HTTP 200` com payload `{"erro": true}`.
- **Particularidades críticas:**
  - **CEP genérico** (ex.: `01000-000` "São Paulo" sem rua): retorna `bairro = ""`, `logradouro = ""` mas traz `localidade`, `uf`, `ibge`.
  - **CEP compartilhado** (loteamentos novos): `logradouro` pode vir `""` e o caller deve tratar.
  - Atributo `ibge` é **essencial** como chave de cidade canônica brasileira.

#### 2.2.6. IP Geolocation (`IPG`)

- **Endpoint padrão:** `https://ipapi.co/{ip}/json/` (compatível com `ip-api.com`).
- **Saída típica:** `ip`, `country_code`, `country_name`, `region_code`, `region`, `city`, `zip`, `latitude`, `longitude`, `timezone`, `asn`, `org`, `error`.
- **Propriedades:**
  - Precisão: **cidade-nível** (não rua, não bairro).
  - Falha silenciosa para IPs privados/reservados: `error: true` ou `status: "fail"` com mensagem (`private range`, `reserved range`, `invalid query`).
  - **Sem garantia de exatidão** para decisões de cobertura.
  - Cobertura limitada para IPv6 em provedores gratuitos.
  - Privacidade: o IP é um dado pessoal sob LGPD/GDPR; tratar como PII.

### 2.3. Resumo de uso

| Necessidade de negócio | Provedor primário | Fallback |
|------------------------|-------------------|----------|
| "Onde estou agora?" | `GPS` | `IPG` |
| Autocomplete de endereço | `PHO` (público) | `NOM` (com rate limit) |
| Busca por CEP | `CEP` | `NOM` |
| Reverse geocode (lat/lon → endereço) | `PHO` (reverse) | `NOM` (reverse) |
| Cobertura de cidade/estado | `CEP` (IBGE) | `NOM` (admin level) |
| Sinal de país (anti-fraude, idioma) | `IPG` | `GPS` (navegador) |
| Geofencing operacional | `GPS` + `PHO` reverse | `OSM` polígonos |

---

## 3. Hierarquia Oficial de Fontes de Verdade

A hierarquia é **estrita**: um campo com autoridade maior sobrescreve um campo com autoridade menor, salvo exceções explícitas da Seção 5.

### 3.1. Ordem de autoridade (do mais alto para o mais baixo)

1. **`GPS` (Browser Geolocation)** — autoridade máxima para **coordenadas (lat, lon) e precisão espacial exata**.
2. **`CEP` (ViaCEP)** — autoridade máxima para **CEP, bairro oficial, cidade canônica (IBGE) e UF** no Brasil.
3. **`NOM` (Nominatim)** — autoridade máxima para **hierarquia administrativa** quando `CEP` não cobre (exterior).
4. **`PHO` (Photon)** — autoridade para **autocomplete, ranking, geocoding interativo** (usado como intermediário de UX).
5. **`OSM` (dados primários)** — fonte de dados; nunca consumido direto.
6. **`IPG` (IP Geolocation)** — **menor autoridade**; usada apenas como **sinal fraco**.

### 3.2. Regra de ouro

> **Coordenadas** são autoridade do `GPS`. **Endereço textual** é autoridade do `CEP` (Brasil) ou `NOM` (exterior). **Nenhuma** decisão de negócio usa `IPG` como entrada única.

### 3.3. Exceções explícitas

- Quando `GPS.accuracy` > 500m, sua autoridade sobre (lat, lon) é **suspensa** e o sistema passa a aceitar coordenada de `PHO` reverse se a diferença for < 100m.
- Quando `CEP` retorna `bairro = ""` (CEP genérico), a autoridade do `CEP` para `bairro` é **suspensa** e o sistema tenta `PHO` reverse.
- Quando `NOM` e `PHO` divergem em `city`, prevalece `NOM` (Nominatim tem admin-level mais preciso).
- `IPG` **nunca** sobrescreve `CEP`, `NOM` ou `PHO`. Apenas **preenche lacunas** quando as outras fontes falham.

---

## 4. Matriz de Confiança por Provedor

A confiança é uma tupla `(precisão espacial, completude, atualidade, confiança-de-provedor)` expressa em escala **0.0 – 1.0**.

### 4.1. Matriz canônica

| Provedor | Coordenada | Endereço | CEP | Bairro | Cidade | UF | País | Atualidade | Confiância global |
|----------|:----------:|:--------:|:---:|:------:|:------:|:--:|:----:|:----------:|:-----------------:|
| `GPS` (accuracy ≤ 50m) | **0.95** | n/a | n/a | n/a | n/a | n/a | n/a | tempo real | 0.95 |
| `GPS` (50m < accuracy ≤ 200m) | 0.80 | n/a | n/a | n/a | n/a | n/a | n/a | tempo real | 0.80 |
| `GPS` (200m < accuracy ≤ 500m) | 0.60 | n/a | n/a | n/a | n/a | n/a | n/a | tempo real | 0.60 |
| `GPS` (accuracy > 500m) | 0.30 | n/a | n/a | n/a | n/a | n/a | n/a | tempo real | 0.30 |
| `CEP` (exato, logradouro preenchido) | n/a | **0.95** | **1.00** | **0.90** | **0.98** | **1.00** | 0.95 | mensal | 0.97 |
| `CEP` (genérico, logradouro vazio) | n/a | 0.30 | 1.00 | 0.10 | 0.98 | 1.00 | 0.95 | mensal | 0.55 |
| `NOM` (importance ≥ 0.5) | 0.85 | 0.80 | 0.70 | 0.65 | 0.90 | 0.95 | 0.95 | diária | 0.85 |
| `NOM` (importance 0.2–0.5) | 0.75 | 0.65 | 0.55 | 0.55 | 0.85 | 0.90 | 0.95 | diária | 0.75 |
| `NOM` (importance < 0.2) | 0.50 | 0.40 | 0.30 | 0.40 | 0.70 | 0.80 | 0.90 | diária | 0.55 |
| `PHO` (layer=house) | 0.85 | 0.75 | 0.60 | 0.60 | 0.80 | 0.85 | 0.90 | diária | 0.80 |
| `PHO` (layer=street) | 0.70 | 0.60 | 0.40 | 0.55 | 0.75 | 0.85 | 0.90 | diária | 0.70 |
| `PHO` (layer=city ou maior) | 0.55 | 0.40 | 0.30 | 0.40 | 0.70 | 0.80 | 0.90 | diária | 0.60 |
| `OSM` (dados primários) | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| `IPG` (país) | 0.30 | 0.10 | 0.05 | 0.10 | 0.30 | 0.40 | **0.90** | semanal | 0.45 |
| `IPG` (cidade) | 0.25 | 0.10 | 0.05 | 0.10 | 0.40 | 0.35 | 0.85 | semanal | 0.35 |
| `IPG` (lat/lon) | 0.20 | n/a | n/a | n/a | n/a | n/a | n/a | semanal | 0.20 |

### 4.2. Interpretação

- **Confiança ≥ 0.80:** autoritativo. Pode ser usado em decisão de negócio.
- **Confiança 0.50–0.80:** informativo. Usado para preencher lacunas.
- **Confiança < 0.50:** sinal fraco. Apenas para heurística e telemetria.

### 4.3. Cálculo combinado

Quando o sistema combina fontes (ex.: `GPS` para coordenadas + `CEP` para endereço), a confiança do campo final é a **média ponderada pelas áreas de autoridade** e o **mínimo dos dois** quando se tratam de campos da mesma classe (ex.: bairro `CEP` 0.90 + bairro `NOM` 0.65 → 0.65, pelo mínimo conservador).

---

## 5. Regras de Resolução de Conflitos

### 5.1. Catálogo de cenários

#### Cenário 1 — Bairro divergente entre Nominatim e ViaCEP

**Regra:** `CEP` vence para logradouro, bairro, cidade, UF e IBGE. `NOM` vence para o campo `display_name` consolidado (sempre que usado para apresentação).

**Justificativa:** ViaCEP é a autoridade oficial brasileira para o par (CEP → endereço). Nominatim é fonte derivada do OSM, que pode estar desatualizado.

**Exceção:** se o `CEP` é genérico (`logradouro = ""` e `bairro = ""`) e `NOM` tem `importance ≥ 0.5`, `NOM` pode fornecer o bairro. O caller **deve** marcar a flag `bairro_unstable = true`.

#### Cenário 2 — Cidade divergente entre IP e GPS

**Regra:** `GPS` vence, **sempre**. `IPG` é apenas heurística; nenhuma decisão de negócio usa IP isoladamente.

**Comportamento adicional:** se a cidade de `IPG` diverge em mais de 50km da cidade inferida por `GPS+reverse`, registrar telemetria `geo.city_divergence`.

#### Cenário 3 — CEP ausente

**Regra:**
1. Tentar `NOM` reverse em (lat, lon) do `GPS` para extrair `postcode`.
2. Se falhar, tentar `PHO` reverse.
3. Se ainda vazio, marcar campo `cep = null` e seguir pipeline; usuário poderá preencher manualmente.
4. **Nunca** inferir CEP por truncamento de coordenadas.

#### Cenário 4 — CEP genérico

**CEP genérico** = CEP que cobre uma área administrativa (cidade, distrito) sem logradouro definido.

**Detecção:** `logradouro = ""` **E** `bairro = ""` no payload do `CEP`.

**Regra:**
1. Marcar o registro com flag `cep_generic = true`.
2. Não usar para entrega ponto-a-ponto.
3. Combinar com `GPS` (accuracy ≤ 200m) para encontrar logradouro via reverse.
4. Persistir o CEP genérico como **cidade canônica**; o logradouro virá de `GPS`+`PHO` reverse.

#### Cenário 5 — Coordenadas sem endereço

**Regra:**
1. Persistir coordenadas com `address_source = "gps"` e `address_confidence = 0`.
2. Disparar job assíncrono de **enriquecimento reverso** (queue `geo-enrichment`).
3. Worker executa `PHO` reverse → `NOM` reverse → preenche `address_*`.
4. SLA: enriquecido em até 60s.

**Nunca** exibir o ponto no mapa sem antes tentar reverse (UX inaceitável).

### 5.2. Regras gerais transversais

- Toda divergência **gera telemetria** (Seção 11).
- Toda divergência é **registrada** em `audit_log` se afetar cobertura de entrega, antifraude ou billing.
- Toda decisão automática é **explicável**: o sistema pode dizer "venci `CEP` sobre `NOM` porque autoridade oficial brasileira".

### 5.3. Matriz de desempate

| Campo | 1º | 2º | 3º | 4º |
|-------|-----|-----|-----|-----|
| lat, lon | `GPS` (accuracy ≤ 500m) | `PHO` reverse | `NOM` reverse | `IPG` (apenas fallback) |
| logradouro | `CEP` (não-genérico) | `NOM` | `PHO` | manual |
| número | `GPS`+reverse | `CEP` | manual | n/a |
| complemento | manual | `CEP.complemento` | n/a | n/a |
| bairro | `CEP` (não-genérico) | `NOM` | `PHO` | manual |
| cidade | `CEP.localidade` (IBGE) | `NOM.address.city` | `PHO.properties.city` | `IPG.city` |
| UF | `CEP.uf` | `NOM.address.state` | `PHO.properties.state` | `IPG.region` |
| país | `GPS` reverse | `IPG.country` | `NOM` | manual |
| CEP | input usuário | `GPS` reverse → `NOM` | `PHO` reverse | manual |

---

## 6. Contrato Canônico de Localização

### 6.1. Identidade do registro

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `location_id` | UUID v7 | sim | Identificador canônico. |
| `created_at` | ISO 8601 (UTC) | sim | Criação. |
| `updated_at` | ISO 8601 (UTC) | sim | Última atualização. |
| `version` | integer | sim | Versão do schema (começa em 1). |

### 6.2. Coordenadas

| Campo | Tipo | Obrigatório | Validação | Provedor preferencial |
|-------|------|-------------|-----------|------------------------|
| `lat` | decimal | sim | -90 ≤ lat ≤ 90; precisão 6 casas | `GPS` |
| `lon` | decimal | sim | -180 ≤ lon ≤ 180; precisão 6 casas | `GPS` |
| `accuracy_m` | integer | não | > 0; default null | `GPS.coords.accuracy` |
| `altitude_m` | decimal | não | null se indisponível | `GPS.coords.altitude` |
| `heading_deg` | decimal | não | 0–360; null se parado | `GPS.coords.heading` |
| `speed_mps` | decimal | não | ≥ 0; null se parado | `GPS.coords.speed` |
| `coord_source` | enum | sim | `gps`, `reverse_geocode`, `manual`, `ip_fallback` | — |
| `coord_source_provider` | enum | sim | `GPS`, `PHO`, `NOM`, `IPG`, `MANUAL` | — |
| `coord_captured_at` | ISO 8601 | sim | Timestamp da captura original | — |
| `coord_confidence` | decimal 0–1 | sim | Derivado da Seção 4 | — |

### 6.3. Endereço canônico

| Campo | Tipo | Obrigatório | Provedor preferencial | Notas |
|-------|------|-------------|------------------------|-------|
| `cep` | string(8) | sim* | `CEP` | Sem máscara. `*` = pode ser null na criação |
| `logradouro` | string | sim* | `CEP` | Tipo + nome. `*` = obrigatório para entrega |
| `numero` | string | sim* | `GPS`+reverse / manual | Pode ser "S/N" (sem número) |
| `complemento` | string | não | manual | Apto, bloco, sala, etc. |
| `unidade` | string | não | `CEP.unidade` | Raro; manter se presente |
| `bairro` | string | sim* | `CEP` (não-genérico) | `*` = obrigatório para entrega |
| `cidade` | string | sim | `CEP.localidade` | Nome canônico |
| `cidade_ibge` | string(7) | sim* | `CEP.ibge` | Código IBGE. `*` = obrigatório para Brasil |
| `uf` | string(2) | sim | `CEP.uf` | Sigla em maiúscula |
| `pais` | string | sim | `GPS` reverse / `IPG` | ISO 3166-1 alpha-2 |
| `pais_nome` | string | sim | `GPS` reverse | Nome em PT-BR |

### 6.4. Proveniência e governança

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `address_source` | enum | sim | `cep`, `reverse_geocode`, `manual`, `imported` |
| `address_source_provider` | enum | sim | `CEP`, `PHO`, `NOM`, `MANUAL`, `IMPORTED` |
| `address_resolved_at` | ISO 8601 | sim | Última resolução |
| `address_confidence` | decimal 0–1 | sim | — |
| `flags.cep_generic` | boolean | sim | true se ViaCEP retornou sem logradouro |
| `flags.bairro_unstable` | boolean | sim | true se bairro veio de NOM/PHO (não ViaCEP) |
| `flags.address_unresolved` | boolean | sim | true se não há logradouro resolvido |
| `flags.requires_review` | boolean | sim | true se divergência relevante persistir |

### 6.5. Cobertura operacional

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `coverage.in_polygon` | boolean | sim | true se ponto está dentro de polígono de cobertura |
| `coverage.in_radius` | boolean | sim | true se ponto está dentro do raio da merchant mais próxima |
| `coverage.nearest_merchant_id` | UUID | não | Merchant mais próxima |
| `coverage.distance_to_merchant_m` | integer | não | — |
| `coverage.last_checked_at` | ISO 8601 | sim | — |
| `coverage.override` | enum | sim | `none`, `admin_force_in`, `admin_force_out` |

### 6.6. Auditoria

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `audit.ip` | string | sim | IP da requisição |
| `audit.user_agent` | string | sim | — |
| `audit.request_id` | UUID | sim | Correlação cross-serviço |
| `audit.actor_id` | UUID | não | Usuário quando aplicável |
| `audit.previous_location_id` | UUID | não | Para histórico de mudanças |

### 6.7. Regras de invariância

1. **`pais = "BR"` ⇒ `cidade_ibge` é obrigatório.**
2. **`pais = "BR"` ⇒ `uf` deve ser uma das 27 UFs válidas.**
3. **`coord_source = "gps"` ⇒ `accuracy_m` é obrigatório.**
4. **`address_source = "cep"` ⇒ `cep` é obrigatório e `cep_generic` reflete o estado real.**
5. **`flags.address_unresolved = true` ⇒ `coverage.in_polygon = false`** (cobertura não pode ser inferida sem endereço).

---

## 7. Pipeline Oficial de Geolocalização

### 7.1. Visão geral

```
[1. CAPTURA] → [2. ENRIQUECIMENTO] → [3. NORMALIZAÇÃO] → [4. CONCILIAÇÃO] → [5. COBERTURA] → [6. PERSISTÊNCIA] → [7. ENRIQUECIMENTO ASSÍNCRONO]
```

### 7.2. Estágios

#### Estágio 1 — Captura

- **Origens possíveis:**
  - `GPS` via `navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 })`.
  - Input manual (formulário de checkout, cadastro).
  - CEP digitado.
  - Autocomplete (consulta `PHO` debounced ≥ 300ms).
- **Saída:** objeto `RawLocation` com `lat?`, `lon?`, `cep?`, `logradouro?`, `numero?`, `bairro?`, `cidade?`, `uf?`, `pais?`, `accuracy?`.

#### Estágio 2 — Enriquecimento

Executa em paralelo (com timeout curto):
- Se `cep` presente → `CEP` (ViaCEP).
- Se `(lat, lon)` presente → `PHO` reverse (primário) e `NOM` reverse (secundário).
- Se `IPG` ainda não consultado → consultar uma vez por sessão (cookie/cache).

**Saída:** `EnrichedLocation` com candidatos por campo e confiança.

#### Estágio 3 — Normalização

- Aplica regras da Seção 8.
- Resolve `cidade_ibge`, `pais_nome`, `uf` canônico.
- Preenche flags.

**Saída:** `NormalizedLocation` compatível com o contrato canônico.

#### Estágio 4 — Conciliação

- Aplica regras de conflito da Seção 5.
- Calcula `coord_confidence` e `address_confidence`.
- Decide se a localização precisa de revisão manual (flag `requires_review`).

**Saída:** `CanonicalLocation` pronta para persistência.

#### Estágio 5 — Cobertura

- Verifica se o ponto está em polígono de cobertura.
- Verifica se está no raio da merchant mais próxima.
- Aplica overrides administrativos (se houver).

**Saída:** `CoverageDecision` (in/out + merchant + distância).

#### Estágio 6 — Persistência

- Grava na tabela `locations` com `audit`.
- Emite evento `location.created` ou `location.updated` para os módulos interessados.

#### Estágio 7 — Enriquecimento Assíncrono

- Worker `geo-enrichment` processa localizações com `address_unresolved = true`.
- Tenta resolver via `NOM`/`PHO` reverse novamente (dados podem ter sido ingeridos no OSM).
- Atualiza o registro e remove a flag se resolver.

### 7.3. SLA

| Etapa | SLA p95 | SLA p99 |
|-------|---------|---------|
| Captura `GPS` | 1500ms | 3000ms |
| `CEP` lookup | 300ms | 800ms |
| `PHO` reverse | 500ms | 1200ms |
| `NOM` reverse | 1500ms | 3000ms |
| Pipeline completo (GPS→persistência) | 2500ms | 5000ms |
| Enriquecimento assíncrono | 60s | 5min |

### 7.4. Pontos de invalidação de cache

- Mudança de endereço: invalida cache do `cep` e do `address`.
- Movimento > 500m em < 60s: invalida cache de `GPS`.
- Merchant atualiza polígono de cobertura: invalida cache de `coverage` para CEPs contidos.

---

## 8. Regras de Normalização

### 8.1. Endereço

- **Caixa:** `Title Case` para logradouro, bairro, cidade, complemento. Exceção: Siglas (BR, Av., Dr., S/N) permanecem em maiúscula.
- **Espaço:** trim em todas as pontas. Múltiplos espaços internos → 1 espaço.
- **Pontuação:** remover `,` à direita; manter pontos abreviados padrão (`Av.`, `R.`, `Dr.`).
- **Tipo de logradouro:** expandir abreviações comuns (`R.` → `Rua`, `Av.` → `Avenida`, `Al.` → `Alameda`, `Tv.` → `Travessa`, `Pc.` → `Praça`).
- **Acentuação:** manter original. Conversão NFD→NFC obrigatória no storage.

### 8.2. CEP

- Manter **somente dígitos** no storage (8 chars).
- Validação: regex `^\d{8}$`.
- Máscara apenas na apresentação: `XXXXX-XXX`.
- CEP `00000-000` é inválido (CEP nulo dos Correios).
- CEP `99999-999` é inválido (reservado para teste).
- CEPs terminados em `-000` são **genéricos** (cobrem uma cidade inteira) e devem ser marcados com `cep_generic = true`.

### 8.3. Bairro

- Title Case. Remover prefixos redundantes (`Bairro: `, `Distrito: `).
- Se o bairro vier como "Setor X", "Quadra Y", tratar como label interno e mover para `complemento` se apropriado.
- `bairro = ""` ⇒ `bairro = null` no contrato; nunca string vazia.

### 8.4. Cidade

- Title Case completo (`São Paulo`, `Rio de Janeiro`).
- `localidade` do ViaCEP é a fonte canônica no Brasil.
- Para cidades homônimas (ex.: `Santos` em SP e `Santos` em MG), `cidade_ibge` é o desempate obrigatório.

### 8.5. Estado (UF)

- 2 caracteres, maiúsculo.
- Lista canônica: AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO.
- Estado brasileiro sempre armazena também `pais = "BR"`.
- Quando vier de `IPG.region`, validar contra lista canônica; caso inválido, marcar `flags.requires_review = true`.

### 8.6. País

- `pais` = código ISO 3166-1 alpha-2 (`BR`, `US`, `PT`).
- `pais_nome` = nome em PT-BR.
- Brasil: `BR`/`Brasil`. Portugal: `PT`/`Portugal`.

### 8.7. Coordenadas

- WGS84 (EPSG:4326).
- 6 casas decimais (~11cm de precisão).
- Se entrada vier com mais casas, truncar para 6.
- Se entrada vier em DMS, converter para decimal.

### 8.8. Proveniência

- Cada campo preenchido **carrega** o par `(source, source_provider, resolved_at, confidence)`.
- Atualizações incrementais preservam histórico (snapshot imutável + versão).

---

## 9. Estratégia de Cache

### 9.1. Camadas

| Camada | Tecnologia sugerida | TTL | Conteúdo |
|--------|---------------------|-----|----------|
| L1 — Memória | LRU in-process | 60s | Última coordenada `GPS` por sessão |
| L2 — Cliente | `sessionStorage` | sessão | Última localização normalizada |
| L3 — Borda | Redis | 5min | Resposta `CEP` por CEP |
| L4 — Borda | Redis | 30min | Resposta `PHO` reverse por (lat, lon) bucketizado |
| L5 — Borda | Redis | 24h | Resposta `NOM` por chave estruturada |
| L6 — Persistente | DB | indefinido | `CanonicalLocation` canônico |

### 9.2. Chaves de cache

- `geo:cep:{CEP8}` → payload ViaCEP normalizado.
- `geo:photon:rev:{lat6}:{lon6}` → payload Photon reverse (precisão 6 casas = ~10cm; bucketizar em 5 casas = ~1m).
- `geo:nominatim:rev:{lat5}:{lon5}` → payload Nominatim reverse.
- `geo:nominatim:fwd:{sha1(query)}` → payload Nominatim forward.
- `geo:photon:fwd:{sha1(query)}` → payload Photon forward.
- `geo:loc:{location_id}` → `CanonicalLocation`.
- `geo:coverage:{cidade_ibge}:{lat5}:{lon5}` → `CoverageDecision` (30min).

### 9.3. Regras de invalidação

- Mudança de polígono de merchant → `DEL geo:coverage:*` para `cidade_ibge` afetada.
- Atualização administrativa manual → `DEL geo:loc:{id}` + emitir evento.
- Atualização do `CEP` do cliente → `DEL geo:loc:{id}` (cascata).
- `GPS` mudou > 500m → `DEL geo:loc:{id}.coord` (preserva address).

### 9.4. Política de cache hit

- `GPS` **nunca** é cacheado entre sessões (precisa de captura fresca).
- `CEP` é cacheado por 5min — ViaCEP não muda em escala de segundos.
- `NOM` é cacheado por 30min (rate limit 1 req/s exige amortização).
- `PHO` é cacheado por 30min.
- `IPG` é cacheado por 24h (precisão cidade-nível não muda tão rápido).

### 9.5. Stampede protection

- `NOM` e `PHO` usam **single-flight** (apenas uma requisição upstream por chave, demais esperam).
- `NOM` requer jitter mínimo entre 1100ms e 1300ms entre chamadas (cumprir Usage Policy).

---

## 10. Estratégia de Retry e Fallback

### 10.1. Política geral

- **Timeout por provedor:** tabela da Seção 7.3.
- **Retries:** máximo 2 por chamada.
- **Backoff:** exponencial com jitter (`100ms → 300ms → 900ms`).
- **Idempotência:** todas as chamadas a provedores são GET/HEAD; idempotentes por natureza.

### 10.2. Fallback por provedor

| Tentativa | Provedor primário | Fallback 1 | Fallback 2 | Erro final |
|-----------|-------------------|-----------|-----------|------------|
| CEP lookup | `CEP` | `NOM` structured | input manual | persistir com `address_unresolved = true` |
| Forward geocode | `PHO` | `NOM` | `CEP` structured (quando houver CEP) | erro de UX |
| Reverse geocode | `PHO` | `NOM` | `IPG` (apenas pais/cidade) | persistir só coordenadas |
| Autocomplete | `PHO` | `NOM` (apenas bairro/cidade) | cache local (últimas buscas) | mensagem "sem resultados" |

### 10.3. Erros transitórios vs permanentes

- **Transiente (retry):** `5xx`, `429`, `ETIMEDOUT`, `ECONNRESET`, `PHO` timeout.
- **Permanente (não retry):** `400` do ViaCEP, `4xx` do Nominatim (exceto 429), CEP `erro: true`.
- **Resposta vazia válida:** tratar como `address_unresolved` (sem retry, mas enfileirar para enriquecimento assíncrono).

### 10.4. Circuit breaker

- **Provedor sadio:** circuit `closed`.
- **Threshold:** 5 falhas em 30s → circuit `open`.
- **Recuperação:** após 60s, half-open com 1 chamada de teste.
- **Half-open → closed** se sucesso. **Half-open → open** se falhar.
- **Métrica:** estado do circuit por provedor exposto no painel de observabilidade.

### 10.5. Fila de enriquecimento assíncrono

- Respostas vazias geram evento `geo.location.under_resolved`.
- Worker dedicado consome e re-tenta com backoff maior (1min, 5min, 30min, 2h).
- Após 5 tentativas, evento vai para DLQ e marca `requires_review = true`.

---

## 11. Estratégia de Observabilidade

### 11.1. Logs

#### Estrutura

Todos os logs de geolocalização devem conter:

```json
{
  "ts": "2026-06-05T12:34:56.789Z",
  "level": "info",
  "service": "geo-pipeline",
  "request_id": "uuid",
  "actor_id": "uuid?",
  "event": "geo.location.resolved",
  "provider_chain": ["CEP", "PHO", "GPS"],
  "lat": -23.5475,
  "lon": -46.6361,
  "cep": "01310100",
  "cidade_ibge": "3550308",
  "coord_confidence": 0.95,
  "address_confidence": 0.92,
  "flags": { "cep_generic": false, "bairro_unstable": false, "address_unresolved": false },
  "duration_ms": 412,
  "cache": { "hit_l1": false, "hit_l3": true, "hit_l4": false }
}
```

#### Eventos canônicos

- `geo.location.created`
- `geo.location.updated`
- `geo.location.enriched`
- `geo.location.unresolved`
- `geo.coverage.checked`
- `geo.coverage.override_applied`
- `geo.conflict.resolved`
- `geo.provider.error`
- `geo.provider.timeout`
- `geo.circuit_breaker.state_change`

### 11.2. Métricas

#### Counter

- `geo_requests_total{provider, status}` — total de chamadas por provedor.
- `geo_conflicts_total{field, resolver}` — divergências resolvidas.
- `geo_cache_hits_total{layer, key_pattern}` — acertos de cache.
- `geo_unresolved_total{reason}` — localizações não resolvidas.
- `geo_circuit_breaker_transitions_total{provider, from, to}`.

#### Histogram

- `geo_request_duration_seconds{provider, op}` — latência por provedor/operação.
- `geo_pipeline_duration_seconds{stage}` — latência por estágio.
- `geo_accuracy_meters` — distribuição de `accuracy` do GPS.

#### Gauge

- `geo_circuit_breaker_state{provider}` (0 = closed, 1 = half-open, 2 = open).
- `geo_unresolved_backlog` — localizações pendentes.
- `geo_provider_up{provider}` — 1/0.

### 11.3. Traces

- Spans por estágio do pipeline.
- Spans filhos por chamada de provedor.
- Atributos: `provider`, `op`, `cache_hit`, `request_id`, `correlation_id`.
- Sampling: 100% para erros, 10% para sucesso (configurável).

### 11.4. Telemetria de divergências

Painel dedicado para auditar divergências entre provedores:

- `geo_divergence` — counter por par (provedorA, provedorB, campo).
- `geo_divergence_distance_m` — histogram com a distância de coordenadas entre `GPS` e `PHO` reverse.
- `geo_divergence_field_agreement` — gauge (% de campos onde provedores concordam).

### 11.5. Alertas

| Condição | Severidade |
|----------|-----------|
| `geo_provider_up{GPS} == 0` por 5min | P3 |
| `geo_provider_up{NOM} == 0` por 5min | P3 |
| `geo_provider_up{CEP} == 0` por 5min | P2 |
| Taxa de `geo_unresolved_total` > 5% por 10min | P2 |
| p99 de `geo_pipeline_duration_seconds` > 5s por 5min | P3 |
| `geo_circuit_breaker_state{provider=*} == 2` (open) | P2 |
| Divergência entre `CEP` e `NOM` em > 10% dos lookups por 1h | P3 |

### 11.6. Auditoria

- Toda alteração de `coverage.override` registra entrada em `audit_log`.
- Toda alteração de `flags.requires_review` é auditada.
- Retenção de logs de geo: 90 dias quente, 1 ano frio.

---

## 12. Estratégia de Cobertura de Entrega

### 12.1. Premissas

- Cobertura de entrega é uma decisão **operacional e financeira**, não técnica.
- **Nunca** baseada em nome de bairro, CEP isolado ou IP.
- **Sempre** combinando pelo menos dois critérios: geometria (polígono/raio) **e** validação por endereço canônico.

### 12.2. Tipos de cobertura

#### 12.2.1. Polígono (`coverage.in_polygon`)

- Polígonos são definidos por admin/merchant e armazenados em `coverage_polygons` (PostGIS `geometry(Polygon, 4326)`).
- Cada polígono pertence a uma `merchant_id` e tem `kind` (`delivery`, `pickup`, `express`).
- Match via `ST_Contains(polygon, point)`.
- Indexação por GIST.

#### 12.2.2. Raio (`coverage.in_radius`)

- Aplicado quando merchant não tem polígono mas tem `coverage_radius_m`.
- Cálculo: `ST_DWithin(merchant_point, customer_point, radius_m)`.
- Fator de correção: raio efetivo = `radius_m * (1 + traffic_factor)`. `traffic_factor` configurável por merchant.
- Indexação por GIST.

#### 12.2.3. Coordenadas (`coord_source` validado)

- Cobertura é checada **apenas** se `coord_confidence ≥ 0.6` **e** `accuracy_m ≤ 500m`.
- Caso contrário, cobertura fica em `pending` e o sistema usa heurística por CEP/cidade.

#### 12.2.4. Geofencing

- Definição de zonas especiais: `no_delivery`, `pickup_only`, `surge_zone`, `force_in`.
- Cada zona tem `policy` (allow/deny) e prioridade.
- Avaliação: deny > allow explícito > allow implícito.
- Audit obrigatório para zonas `force_in` e `no_delivery`.

### 12.3. Algoritmo de decisão

```
1. Se coverage.override != "none":
   - aplicar override e audit
   - fim

2. Se coord_confidence >= 0.6 E accuracy_m <= 500m:
   - in_polygon = ST_Contains(any_polygon, point)
   - se in_polygon: merchant = polygon.owner
   - senão: in_radius = ST_DWithin(merchant_point, point, radius)
   - se in_radius: merchant = nearest merchant
   - fim

3. Senão (geometria fraca):
   - in_polygon = false
   - cobertura por cidade/CEP (heurística)
   - se cidade_ibge in merchant.coverage_cities: tentative_in = true
   - flag.requires_review = true
   - fim
```

### 12.4. Critérios de aceitação de cobertura

| Critério | Mínimo |
|----------|--------|
| p99 latência `coverage.check` | 200ms |
| Taxa de falsos positivos (cliente vê merchant, mas courier recusa) | < 1% |
| Taxa de falsos negativos (cliente não vê merchant disponível) | < 0.5% |
| Cobertura avaliada sem geometria válida | < 2% dos pedidos |

### 12.5. Telemetria de cobertura

- Métrica `geo_coverage_decision_total{merchant, decision, reason}`.
- Painel admin mostra divergências entre `coverage.in_polygon` e decisão final de despacho.
- Toda mudança em polígono ou raio é versionada; cobertura é avaliada contra versão vigente do `coverage_version`.

---

## 13. Regras Proibidas

> Toda decisão que viole esta seção é considerada **bug de governança**, não de implementação.

### 13.1. Proibições absolutas

1. **Nunca decidir cobertura de entrega usando apenas nome de bairro.** Bairro é texto livre; pode ser inconsistente.
2. **Nunca decidir cobertura de entrega usando apenas CEP.** CEP cobre áreas grandes; um CEP inteiro pode conter regiões dentro e fora da cobertura.
3. **Nunca confiar apenas em IP para decisões de negócio.** IP é sinal fraco e cidade-nível; cobre só o carrier de saída do cliente.
4. **Nunca persistir coordenadas sem o `coord_source` e `coord_confidence` correspondentes.** Proveniência é obrigatória.
5. **Nunca usar `NOM` como provedor único de autocomplete em produção sem rate limiting, jitter de 1100–1300ms e cache ≥ 30min.** A Usage Policy do Nominatim proíbe o contrário.
6. **Nunca armazenar `display_name` cru do Nominatim como endereço canônico.** É um rótulo localizado, não um endereço estruturado.
7. **Nunca inferir CEP por truncamento de coordenadas.** CEP não é uma projeção linear.
8. **Nunca inferir logradouro a partir de um CEP genérico (`logradouro = ""` no ViaCEP).**
9. **Nunca expor `accuracy_m`, `IPG.isp`, `GPS.heading` ou `IP` em responses públicas.** São sinais sensíveis.
10. **Nunca usar `flags.cep_generic = false` em um endereço cujo ViaCEP retornou `logradouro = ""`.** É literal e auditável.
11. **Nunca chamar o Nominatim sem `User-Agent` identificando o app e contato do operador.** Viola Usage Policy.
12. **Nunca armazenar IP cru além do necessário para a sessão.** LGPD/GDPR; aplicar hashing + retenção curta.
13. **Nunca tratar `NOM.importance < 0.2` como fonte autoritativa.** É ruído estatístico.
14. **Nunca usar `PHO` ou `NOM` para descobrir o IBGE oficial de uma cidade brasileira.** É o `CEP.ibge` a autoridade.
15. **Nunca fundir `coord_source = "gps"` com `coord_source = "ip_fallback"` no mesmo registro.** Mistura domínios de precisão.
16. **Nunca calcular distância usando fórmula de Haversine em escala de cidade sem correção geodésica.** Usar PostGIS `ST_Distance_Sphere` ou `ST_Distance(geography)`.

### 13.2. Proibições operacionais

17. **Nunca desabilitar logs estruturados em produção** para chamadas a provedores de geo. Auditoria exige rastreamento.
18. **Nunca confiar no payload do `IPG` sem validar `status === "success"`** e filtrar `private range` / `reserved range`.
19. **Nunca servir uma localização `address_unresolved = true` como cobertura confirmada** sem flag explícita.
20. **Nunca usar `GPS.accuracy` reportado pelo navegador sem propagar para a confiança final.** O navegador não é a fonte do score.
21. **Nunca criar um `location_id` sem `audit.request_id`.** Rastreabilidade é obrigatória.
22. **Nunca versionar `CanonicalLocation` por sobrescrita.** Toda mudança gera nova versão.

---

## 14. Critérios de Aceitação

### 14.1. Cobertura de testes obrigatória

- **Unitários:** normalização, resolução de conflitos, cálculo de confiança, idempotência do pipeline. Cobertura mínima 90% nas camadas `geo-core/`, `geo-pipeline/`, `geo-coverage/`.
- **Integração:** chamadas reais (ou mockadas) a `CEP`, `PHO`, `NOM` cobrindo todos os cenários da Seção 5.
- **Contrato:** snapshot do `CanonicalLocation` (golden files).
- **E2E:** fluxo GPS → CEP → cobertura → persistência em ambiente staging.
- **Resiliência:** simular `5xx`, `429`, timeout, circuit breaker aberto.
- **Propriedade:** invariantes da Seção 6.7 verificados em property-based tests.

### 14.2. SLAs de qualidade

| Métrica | Meta p95 | Meta p99 |
|---------|----------|----------|
| Latência `CEP` lookup | 300ms | 800ms |
| Latência `PHO` reverse | 500ms | 1200ms |
| Latência `NOM` reverse | 1500ms | 3000ms |
| Latência `coverage.check` | 100ms | 200ms |
| Latência pipeline completo (GPS → persist) | 2500ms | 5000ms |
| Latência enriquecimento assíncrono | 60s | 5min |

### 14.3. SLAs de qualidade de dados

| Métrica | Meta |
|---------|------|
| % de localizações com `address_unresolved = true` | < 3% |
| % de divergências `CEP` × `NOM` em `bairro` | < 1% dos lookups |
| % de divergências `GPS` × `PHO` reverse > 200m | < 0.5% |
| % de `coverage.override = "admin_force_*"` em produção | < 0.1% (audit de qualidade) |
| % de localizações com `flags.requires_review = true` | < 1% |
| % de CEPs genéricos sem flag explícita | 0% (invariante) |

### 14.4. Critérios de release

- Lint, typecheck, build, testes, cobertura: todos verdes.
- Painel de observabilidade provisionado.
- Runbook de incidentes publicado.
- ADR explicando escolha de provedores e fallback registrado.
- Teste de carga: pipeline suporta N req/s alvo (definido por capacidade).
- Audit log indexado e pesquisável.

---

## 15. Casos Especiais

### 15.1. Condomínios

**Sintomas:** endereço tem `logradouro` + `numero`, mas o ponto de entrega é o portão/bloco.

**Tratamento:**
- Persistir `logradouro`, `numero`, `complemento` (ex.: "Bloco A, Apto 42") no contrato canônico.
- `GPS` deve apontar para o portão (ou centro do condomínio).
- `coverage.in_polygon` aceita o ponto do portão.
- Reverse geocode pode falhar no nível de portão; `PHO`/`NOM` retornam o logradouro; `complemento` é manual.

### 15.2. Zona rural

**Sintomas:** sem `logradouro` claro; `CEP` pode ser genérico; `bairro` = comunidade/localidade.

**Tratamento:**
- `cep_generic = true` se ViaCEP retornar sem logradouro.
- `bairro` é o nome da comunidade/localidade (de `NOM` ou `PHO`).
- `logradouro` pode ser a referência popular (ex.: "Estrada Vicinal X, km 5").
- `coverage` é avaliada por polígono/raio, nunca por bairro.
- `coord_confidence` cai para 0.6 mesmo com `accuracy` razoável (sem rede densa OSM).

### 15.3. Distritos

**Sintomas:** uma cidade tem múltiplos distritos; cliente mora em "Distrito de X" da "Cidade Y".

**Tratamento:**
- `cidade` canônico = cidade (IBGE).
- `bairro` = distrito.
- `complemento` pode trazer observações.
- `cidade_ibge` continua sendo o da cidade principal.

### 15.4. Loteamentos novos

**Sintomas:** `CEP` existe, mas ViaCEP retorna `logradouro = ""` e `bairro = ""`; logradouro ainda não foi catalogado pelos Correios.

**Tratamento:**
- `cep_generic = true` se logradouro/bairro vazios.
- `logradouro` pode ser preenchido por `GPS` + `PHO` reverse.
- `bairro` idem, marcado com `bairro_unstable = true`.
- Job de enriquecimento assíncrono tenta re-resolver (Correios/OSM podem catalogar depois).

### 15.5. Endereços sem número

**Sintomas:** logradouro existe, mas sem número (ex.: "Rodovia Castelo Branco, km 32").

**Tratamento:**
- `numero = "S/N"` (string literal canônica) ou referência textual (ex.: "km 32").
- Aceitar "S/N" como válido no input.
- Reverter para `numero = "S/N"` antes de persistir.
- `coverage` por ponto de GPS ou por polígono do logradouro (sem anchor de número).

### 15.6. CEP compartilhado (múltiplas cidades)

**Sintomas:** CEP existe em mais de uma cidade por exceção dos Correios.

**Tratamento:**
- Quando `CEP` retornar ambiguidade: ViaCEP retorna uma `localidade` específica; usar essa.
- Se o cliente indicar outra cidade, `cidade` aceita override manual **com `flags.requires_review = true`**.
- Não tentar auto-resolver a ambiguidade.

### 15.7. Endereços em outros países

**Sintomas:** fluxo de `CEP` (ViaCEP) não cobre.

**Tratamento:**
- `cep = null`, `cidade_ibge = null`.
- `pais` e `uf` vêm de `GPS` reverse ou input manual.
- `NOM` é a autoridade para hierarquia administrativa.
- Cobertura depende de polígonos cadastrados pelo merchant para aquele país.

### 15.8. Cliente em movimento

**Sintomas:** `GPS` muda > 500m em < 60s.

**Tratamento:**
- Para cobertura: usar a **última posição estável** (a anterior à mudança brusca).
- Marcar `flags.requires_review = true` e solicitar confirmação no checkout.
- Não usar a posição atual para entrega se houver inconsistência.

### 15.9. Cliente em túnel / sem sinal GPS

**Sintomas:** `GPS.accuracy` cai > 1000m, ou `POSITION_UNAVAILABLE`.

**Tratamento:**
- `coord_source = "gps"` é mantido, mas `coord_confidence ≤ 0.30`.
- Cobertura fica em `pending`; sistema tenta `IPG` apenas para **cidade** (sinal fraco).
- Solicita input manual do endereço.

### 15.10. Cliente com VPN

**Sintomas:** `IPG` retorna país/cidade inconsistentes com `GPS` ou `CEP`.

**Tratamento:**
- `IPG` é descartado silenciosamente.
- `flags.requires_review = true` se a inconsistência for > 100km.
- Log `geo.ip.vpn_likely` para auditoria antifraude.

---

## 16. Impactos Arquiteturais

### 16.1. Módulos que **devem** obedecer esta skill

| Módulo | Como a skill impacta |
|--------|----------------------|
| **Checkout** | Captura `GPS`, valida cobertura (polígono + raio), exige `address_resolved` antes de avançar. Aplica fluxo de fallback se `address_unresolved`. Loga `geo.location.created` antes de criar o pedido. |
| **Cadastro de endereço** | Aplica pipeline de normalização e enriquecimento. Persiste `CanonicalLocation`. Re-executa cobertura ao salvar. |
| **Busca de restaurantes** | Usa cobertura para filtrar merchants antes da query principal. Garante que o cliente não vê merchants fora do polígono/raio. |
| **Cobertura** | Implementa algoritmo da Seção 12. É o único módulo com permissão de escrever `coverage.override`. |
| **Admin** | Lê `audit_log` de geo; não escreve diretamente em `coverage_polygons` (vai por fluxo versionado). Visualiza divergências entre `CEP` e `NOM`. |
| **Superadmin** | Override de cobertura (`admin_force_in/out`) com motivo obrigatório. CRUD de provedores e chaves. |
| **Analytics** | Consome métricas da Seção 11. Não lê `IP` ou `GPS` direto; usa `CanonicalLocation` anonimizado. |

### 16.2. Módulos de plataforma impactados

- **API Gateway:** enriquece requests com `geo.ip_lookup` automático e `geo.context`.
- **Auth:** mantém referência a `default_location_id` por usuário.
- **Jobs (queue):** `geo-enrichment` worker dedicado.
- **DB:** tabela `locations`, `coverage_polygons`, `geo_audit_log`, `geo_provider_health`.
- **Cache:** namespaces `geo:*`.
- **Observabilidade:** dashboards `geo-overview`, `geo-divergence`, `geo-coverage`.
- **Feature Flags:** `geo_provider_{CEP,PHO,NOM,IPG}`, `geo_circuit_breaker_enabled`, `geo_async_enrichment_enabled`.

### 16.3. Contratos a serem adicionados/atualizados

- `Location` (DTO).
- `CoverageCheck` (request/response).
- `GeoProviderHealth` (status).
- Eventos: `location.created`, `location.updated`, `location.unresolved`, `coverage.checked`, `coverage.override_applied`.

### 16.4. Não-impactados (explicitamente)

- **Catálogo de produtos** (sem dependência de geo).
- **Pagamentos** (apenas consome `location_id` opaco).
- **Autenticação** (apenas consome `default_location_id`).

---

## 17. Plano de Migração

### 17.1. Premissas

> Migração **nunca** quebra funcionalidades existentes. Toda mudança é **dual-write** ou **shadow-read** antes do cutover.

### 17.2. Fases

#### Fase 0 — Diagnóstico

- **Objetivo:** mapear o estado atual.
- **Ações:**
  - Inventariar todas as chamadas a provedores de geo no código (`GPS`, `NOM`, `PHO`, `CEP`, `IPG`).
  - Listar todas as tabelas, cache e APIs que armazenam `lat`, `lon`, `cep`, `bairro`, `cidade`.
  - Medir divergências reais entre `CEP` e `NOM` no tráfego de produção.
  - Catalogar regras de cobertura hardcoded (ex.: "se bairro == 'X', merchant == Y").
- **Saída:** relatório `geo-legacy-audit.md` (worklog).

#### Fase 1 — Fundação (sem mudar comportamento)

- **Objetivo:** introduzir o `CanonicalLocation` sem migrar dados.
- **Ações:**
  - Criar módulo `geo-core/` com tipos, normalizadores e calculador de confiança.
  - Adicionar tabela `locations` nova (vazia).
  - Adicionar flag `GEO_CANONICAL_V2_ENABLED` (off por padrão).
  - Implementar pipeline em modo **shadow**: lê dados legados, processa, escreve em `locations` (novo schema) mas **não** consome.
  - Validar telemetria (logs, métricas, traces).
- **Critério de saída:** shadow write 100% por ≥ 7 dias, telemetria estável, zero erro novo.

#### Fase 2 — Dual-write

- **Objetivo:** gravar simultaneamente no schema legado e no novo.
- **Ações:**
  - Ativar dual-write em todos os pontos de captura.
  - Continuar leitura no schema legado.
  - Comparar contagens e divergências em painel.
  - Adicionar job de **reconciliação** que reescreve a partir do `CanonicalLocation` quando há divergência.
- **Critério de saída:** divergência < 0.5% por ≥ 7 dias, sem regressão de latência.

#### Fase 3 — Dual-read com prioridade

- **Objetivo:** ler do novo schema, com fallback para o legado.
- **Ações:**
  - Adicionar flag `GEO_READ_FROM_V2` (gradual rollout 10% → 50% → 100%).
  - Manter dual-write.
  - Comparar resultados em logs `geo.read_comparison{from=v1,to=v2,equal}`.
- **Critério de saída:** 100% rollout sem regressão funcional.

#### Fase 4 — Cutover

- **Objetivo:** remover escrita no schema legado.
- **Ações:**
  - Desativar `GEO_READ_FROM_V2` (passa a ser sempre ligado).
  - Desativar dual-write no legado.
  - Manter dual-read com fallback legado por mais 30 dias.
  - Backfill de dados legados para o novo schema em background.
- **Critério de saída:** cobertura 100%, zero leitura do legado por ≥ 7 dias.

#### Fase 5 — Limpeza

- **Objetivo:** remover código legado.
- **Ações:**
  - Apagar dual-read e dual-write.
  - Apagar coluna/campo legado (com migration Drizzle).
  - Atualizar AGENTS.md e diagramas.
  - ADR `ADR-XXXX-geo-migration.md` com lições aprendidas.
- **Critério de saída:** nenhum código referencia o schema legado.

### 17.3. Estratégia de migração de dados

#### Tabela `locations` (legado → v2)

- Migrar 100% dos registros em batch.
- Para cada registro legado:
  - Aplicar normalização da Seção 8.
  - Preencher `coord_source`, `coord_confidence` e `address_source` a partir de heurística + auditoria de logs antigos.
  - Se bairro/cidade ausentes, tentar `PHO` reverse a partir do `lat/lon` legado.
  - Se impossível, marcar `address_unresolved = true` e enfileirar.
- Ordem de execução: por `cidade_ibge` em chunks; não trancar a tabela.

#### Tabela `coverage_polygons` (legado → v2)

- Reprojetar geometrias em PostGIS.
- Indexar por GIST.
- Validar com 1% de pontos aleatórios que o match é idêntico.

#### Cache legado (`geo:legacy:*`)

- Manter até Fase 5.
- Invalidação natural via TTL curto (15min).

### 17.4. Migração de regras de cobertura hardcoded

- **Inventário:** listar todas as regras em código que decidem cobertura por bairro/CEP/texto.
- **Classificação:**
  - **Regras espaciais legítimas** → migrar para `coverage_polygons` ou `coverage_cities`.
  - **Regras textuais (bairro/CEP)** → marcar como **proibidas**; buscar sponsor para removê-las ou reescrevê-las.
- **Plano de remoção:** uma regra por vez, com data de deprecation e métrica de impacto.

### 17.5. Rollback

- **Em qualquer fase:** desativar flags e voltar para o estado anterior.
- **Cutover é irreversível** após Fase 5. Antes disso, basta flip de flag.
- **RPO:** zero (dual-write até Fase 4).
- **RTO:** minutos (flip de flag + cache warm-up).

### 17.6. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Quebrar autocomplete em produção | Shadow read com métrica de divergência antes de cutover |
| Performance do pipeline novo | Bench em staging com 2x carga antes de cutover |
| Nominatim ban por violar Usage Policy | Rate limit enforced, jitter, cache agressivo, monitorar 429 |
| Custo de chamadas Photon | Cache 30min, single-flight, métricas de cache hit rate |
| LGPD: vazamento de IP/IPG em logs | Redaction automática em logs de geo (mascarar último octeto) |
| Dados legados sem proveniência | Backfill com flag `migrated_from_legacy = true` |
| Polígonos legados inválidos | Validação PostGIS no backfill; rejeitar e alertar |

### 17.7. Métricas de migração

- `geo_migration_dual_write_total{target, status}`.
- `geo_migration_dual_read_equal_total` vs `geo_migration_dual_read_diff_total`.
- `geo_migration_backfill_pending` (gauge).
- `geo_migration_legacy_hits` (deve cair a zero na Fase 4).
- `geo_migration_rules_removed_total{rule_id}`.

### 17.8. Critérios de go/no-go entre fases

Cada fase precisa cumprir:

- **Testes:** unit, integração, contrato, E2E, propriedade verdes.
- **Lint, typecheck, build:** verdes.
- **Painel de divergência:** estável por ≥ 7 dias.
- **Métricas de produção:** sem regressão > 5% em qualquer SLA da Seção 14.2.
- **Audit log:** 100% das escritas dual capturadas.
- **Sign-off:** um responsável técnico de cada módulo impactado (Seção 16.1).

---

## Apêndice A — Glossário

- **Cobertura:** zona dentro da qual uma merchant pode entregar ou coletar.
- **Concordância:** quando dois ou mais provedores retornam o mesmo valor para o mesmo campo.
- **Endereço canônico:** `CanonicalLocation` definido nesta skill.
- **Enriquecimento:** processo de completar campos faltantes via provedores.
- **Geocoding:** converter endereço textual em coordenadas (forward).
- **Geofencing:** zonas espaciais com regras operacionais.
- **Proveniência:** `(source, source_provider, resolved_at, confidence)` de um campo.
- **Reverse geocoding:** converter coordenadas em endereço (reverse).
- **Sinal fraco:** provedor cuja confiança < 0.5; informativo, não autoritativo.

## Apêndice B — Referências externas

- MDN — Geolocation API. <https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API>
- OpenStreetMap — wiki e tags. <https://wiki.openstreetmap.org>
- Nominatim — Usage Policy e API Reference. <https://nominatim.org/release-docs/develop/api/Search/>
- Photon (Komoot) — API v1 docs. <https://github.com/komoot/photon/blob/master/docs/api-v1.md>
- ViaCEP — Documentação e exemplos. <https://viacep.com.br>
- IP Geolocation — ip-api batch/json. <https://ip-api.com/docs>

## Apêndice C — Versionamento desta skill

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0.0  | 2026-06-05 | Criação inicial da especificação. |

> Mudanças que afetam a Seção 13 (Regras Proibidas) ou o Contrato Canônico (Seção 6) exigem ADR e aprovação explícita.
