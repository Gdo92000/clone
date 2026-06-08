---
type: guide
status: draft
domain: architecture
layer: L2
semantic_priority: 4
tags:
  - type/guide
  - domain/architecture
  - tech/observability
  - lifecycle/active
  - retrieval_domain/architecture
  - context_temperature/warm
aliases:
  - Semantic Observability
  - Graph Health
  - Observabilidade Semântica
created_at: 2026-05-26
updated_at: 2026-05-26
event_type: telemetry
event_priority: 3
snapshot_type: cold
agent_owner: telemetry-agent
coordination_state: released
retrieval_score: 0.8
health_score: 0.9
semantic_drift: 0.0
compression_ratio: 0.0
---

# SEMANTIC OBSERVABILITY

Monitoramento da saúde do grafo semântico do POS. Detecta orphan clusters, dead domains, graph fragmentation, memory inflation e context saturation.

---

## Health Indicators

### Orphan Semantic Clusters

Grupos de notas sem conexão com o grafo principal.

| Size | Severity | Action |
|------|----------|--------|
| 1-3 notas | low | Reconectar manualmente |
| 4-10 notas | medium | Auditoria de backlinks |
| > 10 notas | high | Revisão arquitetural |

Detection: notas que não possuem wikilinks inbound de fora do cluster.

### Dead Retrieval Domains

Domínios de retrieval sem atividade.

| Inactivity | Severity | Action |
|------------|----------|--------|
| > 7 dias | low | Revisar relevância |
| > 30 dias | medium | Candidate para archival |
| > 90 dias | high | Archival automático |

### Stale Contexts

Notas que permanecem em HOT por tempo excessivo.

| Time in HOT | Severity | Action |
|-------------|----------|--------|
| > 24h | low | Sugerir checkpoint |
| > 72h | medium | Forçar snapshot |
| > 7 dias | high | Escalar para supervisor |

### Graph Fragmentation

```
fragmentation = disconnected_components / total_notes
```

| Index | Status |
|-------|--------|
| < 0.05 | healthy |
| 0.05 - 0.15 | acceptable |
| 0.15 - 0.30 | degraded |
| > 0.30 | critical |

### Semantic Drift

Desvio semântico acumulado no grafo:

```
drift_index = sum(cosine_distance(note, hub)) / total_notes
```

| Index | Status |
|-------|--------|
| < 0.1 | healthy |
| 0.1 - 0.3 | acceptable |
| 0.3 - 0.5 | degraded |
| > 0.5 | critical |

### Memory Inflation

Crescimento descontrolado da memória operacional:

```
inflation_rate = memory_growth_bytes / time_window_hours
```

| Rate | Status |
|------|--------|
| < 1KB/h | healthy |
| 1-10KB/h | acceptable |
| 10-100KB/h | warning |
| > 100KB/h | critical |

### Retrieval Explosion

Aumento súbito no volume de retrievals:

```
explosion_ratio = current_retrievals / baseline_retrievals
```

| Ratio | Status | Action |
|:-----:|--------|--------|
| < 2x | healthy | — |
| 2-5x | warning | Investigar causa |
| 5-10x | degraded | Ativar throttling |
| > 10x | critical | Emergency stop |

### Context Saturation

Contexto permanentemente no limite do budget:

```
saturation_time = time_at_or_above_90p_budget / total_session_time
```

| Ratio | Status |
|:-----:|--------|
| < 0.1 | healthy |
| 0.1 - 0.3 | acceptable |
| 0.3 - 0.5 | warning |
| > 0.5 | critical |

---

## Health Scoring

```
health_score = (
    connectivity_weight * 0.25 +
    drift_health * 0.20 +
    inflation_health * 0.15 +
    saturation_health * 0.15 +
    fragmentation_health * 0.15 +
    retrieval_health * 0.10
)
```

| Score | Status |
|:-----:|--------|
| ≥ 0.9 | healthy |
| 0.7 - 0.89 | acceptable |
| 0.5 - 0.69 | degraded |
| < 0.5 | critical |

---

## Semantic Alerts

| Alert | Trigger | Severity | Channel |
|-------|---------|----------|---------|
| ORPHAN_CLUSTER | Cluster > 10 notas | high | event stream |
| DEAD_DOMAIN | Domínio sem retrieval > 30d | medium | event stream |
| STALE_CONTEXT | Nota HOT > 72h | medium | event stream |
| GRAPH_FRAGMENTATION | fragmentation > 0.15 | high | event stream + escalation |
| SEMANTIC_DRIFT | drift > 0.3 | high | event stream |
| MEMORY_INFLATION | inflation > 10KB/h | warning | event stream |
| RETRIEVAL_EXPLOSION | explosion > 5x | critical | event stream + emergency |
| CONTEXT_SATURATION | saturation > 0.5 | critical | event stream + compression |

---

## Degradation Thresholds

| Indicator | Warning | Degraded | Critical |
|-----------|:-------:|:--------:|:--------:|
| Connectivity | < 0.9 | < 0.8 | < 0.6 |
| Semantic drift | > 0.2 | > 0.35 | > 0.5 |
| Memory inflation | > 10KB/h | > 50KB/h | > 100KB/h |
| Context saturation | > 0.3 | > 0.45 | > 0.6 |
| Fragmentation | > 0.1 | > 0.2 | > 0.3 |
| Retrieval explosion | > 3x | > 5x | > 10x |

---

## Observability Dashboard

```
┌─────────────────────────────────────────────────────┐
│              SEMANTIC OBSERVABILITY                  │
├──────────────┬──────────────┬────────────────────────┤
│ Health Score │ Status       │ Alerts                 │
│ 0.92         │ healthy      │ 2 (low)                │
├──────────────┴──────────────┴────────────────────────┤
│ Graph              │ Retrieval       │ Memory        │
│ connectivity: 0.95 │ hit_ratio: 0.88 │ inflation: 2KB│
│ fragmentation:0.02 │ drift: 0.12     │ saturation:0.1│
│ orphans: 1         │ latency: 45ms   │ waste: 0.08   │
├─────────────────────────────────────────────────────┤
│ Active Alerts                                       │
│ • ORPHAN_CLUSTER — cluster notes/map (low)          │
│ • STALE_CONTEXT — 04-AGENTS/ACTIVE_RUNTIME (low)    │
└─────────────────────────────────────────────────────┘
```

---

## Graph Integrity Rules

1. Toda nota deve ter ≥ 1 inbound wikilink (exceto índices)
2. Toda nota deve ter ≥ 1 outbound wikilink
3. Notas órfãs são detectadas e reconectadas automaticamente
4. Clusters isolados > 5 notas disparam alerta
5. Hubs semânticos (priority 5) devem ter ≥ 10 backlinks
6. Notas archived removidas do grafo ativo

---

## Anti-Explosion Rules

1. Memory inflation limit: 100KB/h (acima disso → emergency compression)
2. Retrieval explosion limit: 10x baseline (acima disso → emergency stop)
3. Context saturation limit: 70% do budget sustentado por > 1h → forced snapshot
4. Graph fragmentation limit: 0.3 (acima disso → forced reindex)
5. Semantic drift limit: 0.5 (acima disso → forced archival pruning)

---

## Relações

- [[_index|02-ARCHITECTURE Index]]
- [[02-ARCHITECTURE/RETRIEVAL_TELEMETRY|RETRIEVAL_TELEMETRY]] — Métricas de retrieval
- [[02-ARCHITECTURE/RETRIEVAL_DOMAINS|RETRIEVAL_DOMAINS]] — Domínios monitorados
- [[00-SYSTEM/EVENT_STREAM|EVENT_STREAM]] — Alertas como eventos
- [[00-SYSTEM/CONTEXT_BUDGET_GOVERNANCE|CONTEXT_BUDGET_GOVERNANCE]] — Budget observado
