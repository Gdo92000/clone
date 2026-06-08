---
type: state
status: idle
domain: agents
layer: L1
semantic_priority: 5
tags:
  - type/state
  - domain/agents
  - tech/runtime
aliases:
  - Active Runtime Context
  - Runtime Context
created_at: 2026-05-26
updated_at: 2026-05-26
---

# ACTIVE RUNTIME CONTEXT

Contexto ativo de execução da sessão corrente. Desacoplado do [[CURRENT_STATE]] para evitar crescimento infinito. Gerencia tasks ativas, hot memory, blockers e foco operacional.

---

## Session

| Campo | Valor |
|-------|-------|
| Session ID | {{ session_id }} |
| Started at | {{ YYYY-MM-DD HH:mm }} |
| Mode | {{ planning / implementation / audit / recovery }} |
| Token budget | {{ low / medium / high }} |

---

## Active Tasks

| # | Task | Status | Started | Domain |
|---|------|--------|---------|--------|
| 1 | {{ }} | in_progress | {{ }} | {{ }} |
| 2 | {{ }} | pending | {{ }} | {{ }} |

---

## Runtime Blockers

| Blocker | Severity | Since | Resolution |
|---------|----------|-------|------------|
| {{ }} | {{ }} | {{ }} | {{ }} |

---

## Hot Memory

Decisões e observações da sessão atual que ainda não foram consolidadas em [[MEMORY]].

| Timestamp | Observation |
|-----------|-------------|
| {{ }} | {{ }} |

---

## Active ADRs

ADRs abertos na sessão atual.

| ADR | Title | Status |
|-----|-------|--------|
| {{ }} | {{ }} | {{ }} |

---

## Current Operational Focus

<!-- Descrever o foco atual da sessão -->

{{ foco operacional }}

---

## Context Expiration

| Item | Expires at | Auto-prune |
|------|------------|------------|
| Hot memory | {{ }} | yes |
| Active tasks | {{ }} | no |
| Runtime blockers | {{ }} | when resolved |
| Session ID | end of session | yes |

---

## Auto-Pruning Rules

1. Hot memory entries > 24h → movidos para MEMORY.md
2. Completed tasks → removidos após consolidação
3. Resolved blockers → removidos após validação
4. Stale context (>1h sem atividade) → rebaixado para WARM
5. Session >8h → sugerir checkpoint e nova sessão

---

## Context Promotion/Demotion

| Ação | Gatilho |
|------|---------|
| Promote to HOT | Nota referenciada 3+ vezes na sessão |
| Demote to WARM | Nota não referenciada por 30min |
| Demote to COLD | Nota não referenciada por 2h |
| Archive | Fim da sessão, nota não reativada |

---

## Relações

- [[_index|04-AGENTS Index]]
- [[CURRENT_STATE]] — Estado consolidado da sessão
- [[MEMORY]] — Memória permanente
- [[04-AGENTS/SEMANTIC_ROUTING|SEMANTIC_ROUTING]] — Roteamento
- [[00-SYSTEM/CONTEXT_BUDGET_GOVERNANCE|CONTEXT_BUDGET_GOVERNANCE]]
- [[00-SYSTEM/FSM_GOVERNANCE|FSM_GOVERNANCE]]
