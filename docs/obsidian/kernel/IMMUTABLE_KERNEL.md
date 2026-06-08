---
type: registry
status: active
domain: kernel
layer: L0
immutable: true
zone: IMMUTABLE
semantic_priority: 5
tags:
  - registry/immutable
  - governance/kernel
created_at: 2026-05-28
updated_at: 2026-05-28
---

# Immutable Kernel Registry

Este documento mantém a lista oficial de arquivos **imutáveis** do sistema, junto com seus hashes SHA-256 para detecção de alterações não autorizadas.

**IMPORTANTE**: Qualquer modificação nestes arquivos requer um override documentado. Consulte `OVERRIDE_PROTOCOL.md`.

## Como funciona

- O script `validate-kernel.ps1` calcula o hash atual de cada arquivo listado.
- Compara com o hash registrado nesta tabela.
- Se houver diferença, valida se existe um arquivo de override correspondente em `overrides/`.
- Se não houver override, reporta `IMMUTABLE_BREACH`.

## Arquivos Imutáveis (kernel core)

| Arquivo | SHA-256 (preencher pelo validator) | Last Checked | Invariantes |
|---------|-----------------------------------|--------------|-------------|
| AGENTS.md | 55b3ff2eacd367b45466fb130a7ef79a0738946d4f4aef41f5c477064d3cb3f2 | 2026-05-31 | deterministic-boot |
| docs\obsidian\kernel\IMMUTABLE_KERNEL.md | 602bec4bff76aad1d1606ce2390721f491097f4555dce9f73e248392971ea09f | - | self-reference |
| docs\obsidian\kernel\OVERRIDE_PROTOCOL.md | df9358929e335359cb9156b644f94a4440c4dd59ce25f0e72217ddbd4a8c5e59 | - | override-protocol |
| docs\obsidian\kernel\PROTECTED_ZONES.md | d0c354a17279de0746a9ea290d8ef16e00f6d76b656711beb51a592e078b7eb0 | - | zone-definition |
| docs\obsidian\kernel\SCHEMA.md | 05906f1792b8412398089cfd663b44ac3b5d29911ba0f5393f21d7aa1a396ab5 | - | schema-definition |
| docs\obsidian\project-operating-system\00-SYSTEM\CONTEXT_BUDGET_GOVERNANCE.md | 303ef1395318c01228fdded950712e00ecd30f24664e814fff41d45cdecd0d7e | - | budget-compliance |
| docs\obsidian\project-operating-system\00-SYSTEM\EVENT_STREAM.md | fe402692b2bd99c10a5197d81a8e1c85ca80e1e291afa9c90e00332caf3d38c5 | - | event-consistency |
| docs\obsidian\project-operating-system\00-SYSTEM\LAYER_TAXONOMY.md | 978fa420a55c883e8bcc504b484a99265803e31d90f658eb1c07f89e25878c30 | - | layer-structure |
| docs\obsidian\project-operating-system\00-SYSTEM\SYSTEM_CONTRACT.md | d57aebedf79cd6ebb1814c73070b931b9c7b2bcb5a4f1903e469a9ad008f638c | - | fsm-execution, rollback-semantics, prohibitions |

Nota: A coluna SHA-256 será preenchida/atualizada pelo `validate-kernel.ps1` na primeira execução bem-sucedida.

## Invariantes

Cada arquivo imutável preserva invariantes fundamentais:

- `deterministic-boot`: o boot do sistema deve ser determinístico.
- `fsm-execution`: a máquina de estados de execução (FSM) segue as regras.
- `rollback-semantics`: toda operação deve ter rollback disponível.
- `budget-compliance`: o contexto deve respeitar limites de tokens.
- `event-consistency`: o stream de eventos deve ser ordenado e atômico.
- `layer-structure`: a hierarquia de camadas (00-09) deve ser mantida.
- `schema-definition`: o esquema de frontmatter é a referência.
- `zone-definition`: as zonas de proteção são imutáveis.
- `override-protocol`: o protocolo de override deve ser seguido.

## Blast Radius Analysis

Se um arquivo imutável for alterado sem override:
- **Detecção**: validator falha com `IMMUTABLE_BREACH`.
- **Rollback**: recomendado `git checkout <last-good-commit>`.
- **Impacto**: pode invalidar múltiplas dependências (agentes, boot, orquestração).

## Validação

Execute periodicamente:
```powershell
.\scripts\validate-kernel.ps1
```

Integrado ao `pos-test-all.ps1` como teste obrigatório.
