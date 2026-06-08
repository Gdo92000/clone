---
type: contract
status: active
domain: kernel
layer: L0
immutable: true
zone: IMMUTABLE
semantic_priority: 5
tags:
  - meta/governance
  - kernel/zone
created_at: 2026-05-28
updated_at: 2026-05-28
---

# Protected Zones

Definição das zonas de mutabilidade do sistema cognitivo.

## Zonas

### IMMUTABLE

Nunca alterar sem autorização explícita via override protocol.

**Propósito**: Proteger o núcleo fundamental que garante deterministic behavior, orchestration consistency e invariants.

**Exemplos**:
- Execution state machine (FSM)
- Orchestration rules
- Layer taxonomy
- Retrieval rules
- Canonical ownership policy
- Source of truth policy
- Semantic governance
- Invariant definitions
- Rollback/checkpoint semantics
- Safety policies
- Mutation policies
- Routing hierarchy
- Governance contracts

**Enforcement**:
- `immutable: true` no frontmatter.
- Qualquer modificação no arquivo é detectada pelo `validate-kernel.ps1`.
- Para alterar, é necessário criar um arquivo de override em `overrides/` com descrição completa, impacto, dependências, rollback e aprovação (simulada ou humana).

### PROTECTED

Alterável apenas com validação reforçada.

**Propósito**: Permitir evolução controlada de governança, protocolos, padrões, camadas.

**Exemplos**:
- Agent protocol
- Skill registry
- Code standards
- Folder structure
- Feature specs
- Decision logs
- ADRs

**Enforcement**:
- `zone: PROTECTED` no frontmatter.
- Modificações são permitidas, mas devem ser registradas em `log.md` e analisadas quanto a invariantes.
- Pode-se exigir revisão por pares.

### OPERATIONAL

Editável normalmente.

**Propósito**: Estado do projeto, memória operacional, documentação ativa.

**Exemplos**:
- CURRENT_STATE.md
- MEMORY.md
- Indexes (MOCs)
- Páginas da wiki

**Enforcement**: Nenhuma restrição especial além de lint de links.

### EPHEMERAL

Contexto temporário e descartável.

**Propósito**: Logs, workspaces, caches, avaliações. Podem ser limpos periodicamente.

**Exemplos**:
- `00-SYSTEM/evals/workspace/`
- `wiki/log.md`
- `temp/`

**Enforcement**: Arquivos podem ser apagados a qualquer momento; não fazem parte do kernel.

## Aplicação

Cada arquivo de governança deve ter frontmatter com `zone: <ZONE>`. Arquivos com `immutable: true` devem também ter `zone: IMMUTABLE`.

## Mudança de Zona

Alterar a zona de um arquivo é uma mudança **PROTECTED** (ou seja, requer análise de impacto). Não se pode tornar um arquivo `IMMUTABLE` já existente em `OPERATIONAL` sem validação de dependências.
