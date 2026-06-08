---
type: index
status: active
domain: kernel
layer: L0
zone: OPERATIONAL
semantic_priority: 5
tags:
  - type/index
  - domain/kernel
  - governance/immutable
created_at: 2026-05-28
updated_at: 2026-05-28
---

# Cognitive Kernel — Núcleo Imutável

Este é o **núcleo cognitivo imutável** do sistema. Contém as regras fundamentais que não podem ser alteradas sem um override explícito.

## Estrutura do Kernel

| Documento | Propósito | Zona |
|-----------|-----------|------|
| [SCHEMA.md](SCHEMA.md) | Esquema de frontmatter (`immutable`, `zone`) | IMMUTABLE |
| [PROTECTED_ZONES.md](PROTECTED_ZONES.md) | Definição das zonas de proteção | IMMUTABLE |
| [OVERRIDE_PROTOCOL.md](OVERRIDE_PROTOCOL.md) | Protocolo para alterações no kernel | IMMUTABLE |
| [IMMUTABLE_KERNEL.md](IMMUTABLE_KERNEL.md) | Lista de arquivos imutáveis e seus hashes | IMMUTABLE |
| [DEPENDENCY_GRAPH.md](DEPENDENCY_GRAPH.md) | Grafo de dependências do kernel | PROTECTED |
| [index.md](index.md) | Índice de conteúdo do kernel (wiki) | OPERATIONAL |
| [log.md](log.md) | Log cronológico de override requests | EPHEMERAL |
| [overrides/](overrides/) | Diretório de overrides aprovados | OPERATIONAL |

## Princípios

- **Immutable by default**: arquivos marcados `immutable: true` não podem ser modificados sem override.
- **Zones**: classificação de mutabilidade (IMMUTABLE, PROTECTED, OPERATIONAL, EPHEMERAL).
- **Override explícito**: toda mudança crítica requer protocolo de override.
- **Deterministic orchestration**: o kernel garante comportamento deterministico.
- **Invariant preservation**: definição e validação de invariantes.

## Relações

- [POS](../project-operating-system/_index.md) — Sistema operacional do projeto
- [AGENTS.md](../../AGENTS.md) — Kernel bootstrap (também imutável)
- [00-SYSTEM/SYSTEM_CONTRACT.md](../project-operating-system/00-SYSTEM/SYSTEM_CONTRACT.md) — Contrato de execução (imutável)

## Validação

Execute `.\scripts\validate-kernel.ps1` para verificar integridade do kernel.
