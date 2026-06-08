---
type: guide
status: active
domain: system
layer: L0
immutable: true
zone: IMMUTABLE
criticality: HIGH
semantic_priority: 5
aliases:
  - Context Budget
created_at: 2026-05-26
updated_at: 2026-05-28
---

# CONTEXT BUDGET GOVERNANCE

Orçamento de contexto, hierarquia de memória, snapshots e compressão.

## Memory Hierarchy

| Layer | Tipo | Retenção |
|:-----:|------|:--------:|
| L0 | Sessão atual, diff, terminal | Sessão (HOT) |
| L1 | ARC, blockers, ADRs ativos | Sessão (HOT) |
| L2 | Domínio ativo, WARM notes | Sessão (WARM) |
| L3 | Memória consolidada, decisões | 30d (COLD) |
| L4 | Conhecimento geral | Permanente (COLD) |
| L5 | Histórico, deprecated | Permanente (ARCHIVAL) |
| L6 | Templates imutáveis | Permanente (ARCHIVAL) |

## Budget Levels

| Level | Tokens | Uso |
|-------|:------:|-----|
| ULTRA_COMPACT | 2K | Máxima compressão |
| LOW | 8K | Tarefa única |
| STANDARD | 16K | Operação normal |
| HIGH | 32K | Refatoração |
| HIGH_REASONING | 48K | Análise profunda |
| CRITICAL | 64K | Recovery |
| EMERGENCY | 4K | Crise de contexto |

## Compression

| Level | Redução | Quando |
|:-----:|:-------:|--------|
| L0 | 0% | Recovery, deep analysis |
| L1 | 20% | Implementação |
| L2 | 40% | Planejamento |
| L3 | 60% | Debug, compact |
| L4 | 80% | Emergência |

Pipeline: strip ARCHIVAL → strip COLD não referenciadas → resumir WARM → truncar notas > 50 linhas.

## Snapshots

| Type | Freq | Retenção |
|------|:----:|:--------:|
| HOT | 10 eventos | 7 dias |
| WARM | 50 eventos | 30 dias |
| COLD | 200 eventos | 90 dias |
| RECOVERY | On incident | Permanente |

Máx 8 HOT, 3 WARM, 2 COLD ativos. Naming: `{type}_{session}_{seq}_{ts}.snapshot.md`.
