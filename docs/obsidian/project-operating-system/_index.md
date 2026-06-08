---
type: index
status: active
domain: system
layer: L2
zone: OPERATIONAL
semantic_priority: 5
aliases:
  - POS Index
  - POS Router
created_at: 2026-05-26
updated_at: 2026-05-28
---

# POS Router

Bootstrap router do Project Operating System.

## Bootstrap

Perfil ativo e orçamento: ver **`.opencode/profile.json`** (única fonte canônica).

## Core Docs

| Documento | Função | HOT/COLD |
|-----------|--------|:--------:|
| [STATE_ACTIVA.md](./STATE_ACTIVA.md) | Estado ativo (gerado de `phases.jsonl`) | **HOT** |
| [CURRENT_STATE.md](./CURRENT_STATE.md) | View histórica completa (gerada) | COLD |
| [MEMORY.md](./MEMORY.md) | Decisões e lessons learned | WARM |
| [BOOT_ROUTER.md](./BOOT_ROUTER.md) | Roteamento de retrieval | HOT |
| [TASK_CLASSIFIER.md](./TASK_CLASSIFIER.md) | Classificação de tarefas | HOT |
| [00-SYSTEM/SYSTEM_CONTRACT.md](./00-SYSTEM/SYSTEM_CONTRACT.md) | Contrato do sistema | WARM |
| [00-SYSTEM/CONTEXT_BUDGET_GOVERNANCE.md](./00-SYSTEM/CONTEXT_BUDGET_GOVERNANCE.md) | Governança de contexto | WARM |
| [00-SYSTEM/EVENT_STREAM.md](./00-SYSTEM/EVENT_STREAM.md) | Stream de eventos | WARM |

## Domínios (on demand)

| Domínio | Quando |
|---------|--------|
| [02-ARCHITECTURE/](./02-ARCHITECTURE/_index.md) | Decisões arquiteturais |
| [04-AGENTS/](./04-AGENTS/_index.md) | Protocolos de agente |
| [08-SECURITY/](./08-SECURITY/_index.md) | Segurança |
| [99-TEMPLATES/](./99-TEMPLATES/_index.md) | Templates (cold storage) |

## Cold Storage

| Caminho | Regra |
|---------|-------|
| `99-TEMPLATES/` | Skip retrieval |
| `status: deprecated/archived` | Skip retrieval |

## Relações

- [AGENTS.md](../../../AGENTS.md) — Kernel operacional (raiz do projeto)
- [00-SYSTEM/SYSTEM_CONTRACT.md](./00-SYSTEM/SYSTEM_CONTRACT.md) — Contrato
- [00-SYSTEM/CONTEXT_BUDGET_GOVERNANCE.md](./00-SYSTEM/CONTEXT_BUDGET_GOVERNANCE.md) — Budget
- [00-SYSTEM/EVENT_STREAM.md](./00-SYSTEM/EVENT_STREAM.md) — Eventos
- [[../../wiki/index.md|Wiki Index]] — Complementary knowledge base
- [[../kernel/_index.md|Cognitive Kernel]] — Immutable governance core
