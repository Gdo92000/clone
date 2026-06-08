---
type: guide
status: draft
domain: architecture
layer: L2
semantic_priority: 4
tags:
  - type/guide
  - domain/architecture
  - tech/telemetry
  - lifecycle/active
  - retrieval_domain/architecture
  - context_temperature/warm
aliases:
  - Retrieval Telemetry
  - Retrieval Metrics
  - Telemetria de Retrieval
created_at: 2026-05-26
updated_at: 2026-05-26
event_type: telemetry
event_priority: 2
snapshot_type: cold
agent_owner: telemetry-agent
coordination_state: released
retrieval_score: 0.8
health_score: 0.9
semantic_drift: 0.0
compression_ratio: 0.0
---

# RETRIEVAL TELEMETRY

Medição de qualidade e comportamento do sistema de retrieval semântico. Métricas, anomalias, degradação e relatórios de auditoria.

---

## Metrics

### Retrieval Hit Ratio

```
hit_ratio = successful_retrievals / total_retrievals
```

| Threshold | Status | Action |
|-----------|--------|--------|
| ≥ 0.85 | healthy | Monitorar |
| 0.70 - 0.84 | warning | Investigar notas sem match |
| 0.50 - 0.69 | degraded | Auditoria de retrieval domains |
| < 0.50 | critical | Revisão completa do grafo semântico |

### Retrieval Drift

```
drift = semantic_distance(query_embedding, retrieved_embedding)
```

| Threshold | Status | Action |
|-----------|--------|--------|
| < 0.2 | healthy | — |
| 0.2 - 0.4 | warning | Revisar notas com drift alto |
| 0.4 - 0.6 | degraded | Auditoria de domínio |
| > 0.6 | critical | Revisar retrieval domains |

### Semantic Accuracy

```
accuracy = relevant_results / total_results
```

| Threshold | Status |
|-----------|--------|
| ≥ 0.90 | healthy |
| 0.75 - 0.89 | acceptable |
| 0.50 - 0.74 | degraded |
| < 0.50 | critical |

### Context Pollution Rate

```
pollution_rate = irrelevant_tokens / total_context_tokens
```

| Threshold | Status | Action |
|-----------|--------|--------|
| < 0.10 | healthy | — |
| 0.10 - 0.20 | warning | Auditar notas no contexto |
| 0.20 - 0.35 | degraded | Aplicar anti-pollution rules |
| > 0.35 | critical | Emergency context pruning |

### Token Waste

```
token_waste = (total_tokens - useful_tokens) / total_tokens
```

| Threshold | Status |
|-----------|--------|
| < 0.15 | healthy |
| 0.15 - 0.30 | warning |
| > 0.30 | degraded |

### Retrieval Latency

| Latency | Status |
|---------|--------|
| < 100ms | healthy |
| 100-500ms | acceptable |
| 500ms-2s | degraded |
| > 2s | critical |

### Note Activation Frequency

Média de retrievals por nota por sessão:

| Frequency | Interpretation |
|-----------|----------------|
| > 10 | Hot note — pode precisar de snapshot |
| 3-10 | Active note — healthy |
| 1-3 | Low activation — candidate para pruning |
| 0 | Dead note — candidate para archival |

### Semantic Decay Impact

```
decay_impact = (original_score - current_score) / original_score
```

| Impact | Status |
|--------|--------|
| < 0.1 | healthy |
| 0.1 - 0.3 | acceptable |
| 0.3 - 0.5 | warning |
| > 0.5 | critical |

### Retrieval Relevance Score

```
relevance = sum(user_feedback_scores) / total_retrievals
```

Scale: 0.0 (irrelevant) to 1.0 (perfect match)

---

## Efficiency Metrics

### Average Retrieval Tokens

```
avg_retrieval_tokens = total_context_tokens / retrieval_count
```

| Value | Status |
|:-----:|--------|
| < 500 | efficient |
| 500-1500 | acceptable |
| 1500-3000 | wasteful |
| > 3000 | critical — compress |

### Context Compression Ratio

```
compression_ratio = (original_tokens - compressed_tokens) / original_tokens
```

| Ratio | Status |
|:-----:|--------|
| > 0.5 | excellent |
| 0.3 - 0.5 | good |
| 0.1 - 0.3 | poor — increase compression |
| < 0.1 | critical — force compression |

### Semantic Density Score

```
density = semantic_units / total_tokens * 1000
```

| Score | Status |
|:-----:|--------|
| > 50 | high density |
| 25 - 50 | acceptable |
| 10 - 25 | verbose |
| < 10 | rewrite required |

### Retrieval Duplication Rate

```
duplication_rate = duplicate_retrievals / total_retrievals
```

| Rate | Status |
|:-----:|--------|
| < 0.05 | excellent |
| 0.05 - 0.15 | acceptable |
| 0.15 - 0.30 | poor — enable cache |
| > 0.30 | critical — suppression required |

### Retrieval Waste Score

```
waste_score = (total_retrieval_tokens - useful_tokens) / budget
```

| Score | Status |
|:-----:|--------|
| < 0.1 | efficient |
| 0.1 - 0.25 | acceptable |
| 0.25 - 0.5 | wasteful |
| > 0.5 | critical |

### Context Inflation Rate

```
inflation_rate = (current_tokens - baseline_tokens) / baseline_tokens / hours
```

| Rate | Status |
|:-----:|--------|
| < 0.1/h | stable |
| 0.1 - 0.3/h | growing |
| 0.3 - 0.5/h | inflating |
| > 0.5/h | critical — emergency compression |

### Note Verbosity Score

```
verbosity = note_lines / semantic_units
```

| Score | Status |
|:-----:|--------|
| < 3 | compact |
| 3 - 8 | acceptable |
| 8 - 15 | verbose |
| > 15 | rewrite required |

---

## Telemetry Event Schema

```yaml
telemetry_event:
  id: uuid
  type: retrieval_metric | anomaly_detected | degradation_report
  timestamp: ISO-8601
  session_id: string
  agent_id: string
  metric_name: string
  metric_value: float
  threshold: float
  status: healthy | warning | degraded | critical
  domain: string
  affected_notes:
    - path/to/note
      hit_count: number
      last_retrieved: ISO-8601
  context:
    total_tokens: number
    useful_tokens: number
    pollution_tokens: number
    retrieval_count: number
```

---

## Anomaly Detection

| Anomaly | Detection Rule | Severity |
|---------|---------------|----------|
| Retrieval spike | > 50 retrievals/min | medium |
| Drift spike | drift > 0.5 in 5min | high |
| Hit ratio crash | hit_ratio < 0.5 in 10min | critical |
| Pollution surge | pollution_rate > 0.3 | high |
| Token explosion | token_waste > 0.4 | critical |
| Dead domain | 0 retrievals in domain > 1h | low |

---

## Retrieval Degradation Detection

Algorítmo de degradação:

1. Sample retrieval metrics a cada 100 retrievals
2. Compare com baseline da sessão anterior
3. Se degradation > 20%, gerar alerta
4. Se degradation > 40%, ativar auditoria automática
5. Se degradation > 60%, escalar para recovery

Causas comuns:
- Domain misconfiguration
- Orphan note cluster
- Semantic drift no grafo
- Context pollution
- Stale embeddings

---

## Retrieval Audit Reports

Relatório periódico de auditoria:

```yaml
audit_report:
  id: uuid
  period_start: ISO-8601
  period_end: ISO-8601
  total_retrievals: number
  metrics:
    hit_ratio: float
    avg_drift: float
    avg_accuracy: float
    avg_latency: float
    pollution_rate: float
    token_waste: float
  anomalies_detected: number
  degradation_events: number
  recommendations:
    - action: reconfigure_domain | prune_notes | reindex | escalate
      domain: string
      priority: 1-5
```

---

## Relações

- [[_index|02-ARCHITECTURE Index]]
- [[02-ARCHITECTURE/SEMANTIC_OBSERVABILITY|SEMANTIC_OBSERVABILITY]] — Observabilidade do grafo
- [[02-ARCHITECTURE/RETRIEVAL_MINIMIZATION|RETRIEVAL_MINIMIZATION]] — Minimização de retrievals
- [[02-ARCHITECTURE/RETRIEVAL_DOMAINS|RETRIEVAL_DOMAINS]] — Domínios monitorados
- [[04-AGENTS/SEMANTIC_ROUTING|SEMANTIC_ROUTING]] — Roteamento que gera métricas
- [[00-SYSTEM/TOKEN_EFFICIENCY_POLICY|TOKEN_EFFICIENCY_POLICY]] — Eficiência medida
- [[00-SYSTEM/CONTEXT_BUDGET_GOVERNANCE|CONTEXT_BUDGET_GOVERNANCE]] — Budget impactado
