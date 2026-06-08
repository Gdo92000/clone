---
type: contract
status: active
domain: system
layer: L0
immutable: true
zone: IMMUTABLE
criticality: HIGH
semantic_priority: 5
aliases:
  - System Contract
created_at: 2026-05-26
updated_at: 2026-05-28
---

# SYSTEM CONTRACT

Regras imutáveis do sistema. Violação invalida implementação.

## FSM — Execution States

```
IDLE → PLANNING → ANALYSIS → IMPLEMENTATION → VALIDATION → COMPLETED → IDLE
IMPLEMENTATION → BLOCKED → IDLE / ROLLBACK → IDLE
```

### STOP-WORK Conditions
1. CONTRACT_BREACH — regra violada
2. SECURITY_VIOLATION — dado sensível exposto
3. UNBOUNDED_SIDE_EFFECT — efeito colateral não documentado
4. DATA_INCONSISTENCY — estado inconsistente
5. MISSING_ROLLBACK — sem rollback disponível
6. AMBIGUOUS_REQUIREMENT — requisito ambíguo

### Fail-Fast
Erro crítico → STOP imediato. Validação falha → Não prosseguir. Rollback disponível → Reverter. Ambiguidade → Perguntar.

## Core Principles

Deterministic behavior, explicit contracts, minimal coupling, maximum observability, replaceable infrastructure, testable modules.

## Prohibitions

Hidden globals, circular dependencies, direct DB from UI, business logic in controllers, silent failures, unbounded retries, `as any`, `!`, `@ts-ignore`, `eslint-disable`, mocks falsos.

## Verification

Toda alteração deve passar: lint → typecheck → tests → build. Sem validação executada = tarefa não concluída.
