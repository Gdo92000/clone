---
type: graph
status: active
domain: kernel
layer: L0
zone: PROTECTED
semantic_priority: 4
tags:
  - graph/dependency
  - kernel/analysis
created_at: 2026-05-28
updated_at: 2026-05-28
---

# Kernel Dependency Graph

Mapeia as dependências entre os arquivos do kernel para análise de blast radius em caso de mudanças.

## Nodes (arquivos)

### IMMUTABLE

- `AGENTS.md` (root kernel)
- `00-SYSTEM/SYSTEM_CONTRACT.md`
- `00-SYSTEM/CONTEXT_BUDGET_GOVERNANCE.md`
- `00-SYSTEM/EVENT_STREAM.md`
- `00-SYSTEM/LAYER_TAXONOMY.md`
- `kernel/SCHEMA.md`
- `kernel/PROTECTED_ZONES.md`
- `kernel/OVERRIDE_PROTOCOL.md`
- `kernel/IMMUTABLE_KERNEL.md`

### PROTECTED

- `docs/obsidian/project-operating-system/_index.md` (POS router)
- `04-AGENTS/_index.md`
- `04-AGENTS/SKILL_REGISTRY.md`
- `04-AGENTS/AGENT_PROTOCOL.md`
- `04-AGENTS/CAPABILITY_DISCOVERY.md`
- `04-AGENTS/ACTIVE_RUNTIME_CONTEXT.md`

## Edges (dependências)

```mermaid
graph TD
    AGENTS[AGENTS.md] --> POS_INDEX[POS _index.md]
    AGENTS --> KERNEL_INDEX[kernel/_index.md]
    POS_INDEX --> SYSTEM_CONTRACT[00-SYSTEM/SYSTEM_CONTRACT.md]
    POS_INDEX --> LAYER_TAXONOMY[00-SYSTEM/LAYER_TAXONOMY.md]
    POS_INDEX --> AGENT_PROTOCOL[04-AGENTS/AGENT_PROTOCOL.md]
    SYSTEM_CONTRACT --> CONTEXT_BUDGET[00-SYSTEM/CONTEXT_BUDGET_GOVERNANCE.md]
    SYSTEM_CONTRACT --> EVENT_STREAM[00-SYSTEM/EVENT_STREAM.md]
    AGENT_PROTOCOL --> SKILL_REGISTRY[04-AGENTS/SKILL_REGISTRY.md]
    AGENT_PROTOCOL --> CAPABILITY_DISCOVERY[04-AGENTS/CAPABILITY_DISCOVERY.md]
    KERNEL_INDEX --> SCHEMA[kernel/SCHEMA.md]
    KERNEL_INDEX --> PROTECTED_ZONES[kernel/PROTECTED_ZONES.md]
    KERNEL_INDEX --> OVERRIDE_PROTOCOL[kernel/OVERRIDE_PROTOCOL.md]
    KERNEL_INDEX --> IMMUTABLE_KERNEL[kernel/IMMUTABLE_KERNEL.md]
    OVERRIDE_PROTOCOL --> overrides[kernel/overrides]
    IMMUTABLE_KERNEL --> validation[scripts/validate-kernel.ps1]
```

## Criticality Classification

- **HIGH**: arquivos IMMUTABLE. Alteração quebra invariantes.
- **MEDIUM**: arquivos PROTECTED. Exigem validação reforçada.
- **LOW**: arquivos OPERATIONAL/EPHEMERAL.

## Blast Radius Estimation Tools

- `validate-kernel.ps1 --dependencies <file>` — lista arquivos que dependem do alvo.
- `pos-test-all.ps1` — valida coesão geral.

## Notas

- Dependências são extraídas de links markdown e referênciasimplícitas.
- Arquivos com `immutable: true` devem ter dependências mínimas para reduzir blast radius.
