---
type: contract
status: active
domain: kernel
layer: L0
immutable: true
zone: IMMUTABLE
semantic_priority: 5
tags:
  - meta/schema
  - governance/immutable
created_at: 2026-05-28
updated_at: 2026-05-28
---

# Kernel Frontmatter Schema

Define os campos de frontmatter usados para enforce o kernel imutável.

## Campos Obrigatórios

### `immutable: boolean`

Se `true`, o arquivo não pode ser modificado a menos que exista um override correspondente no diretório `overrides/`. Arquivos com `immutable: true` pertencem à zona **IMMUTABLE**.

Exemplo:
```yaml
immutable: true
```

### `zone: enum`

Classifica a mutabilidade do arquivo:

- `IMMUTABLE` — Nunca alterar sem autorização explícita (kernel core).
- `PROTECTED` — Alterável apenas com validação reforçada (governança, regras).
- `OPERATIONAL` — Editável normalmente (estado, memória operacional).
- `EPHEMERAL` — Contexto temporário e descartável (logs, workspaces).

Exemplo:
```yaml
zone: PROTECTED
```

## Campos Opcionais

### `override: string | null`

Se o arquivo tiver `immutable: true` e tiver sido substituído por um override, este campo deve conter o caminho relativo para o arquivo de override (ex: `overrides/2026-05-28_agent-timeout-increase.md`). Se não houver override, omitir ou `null`.

### `invariant: string[]`

Lista de invariantes que este arquivo preserva. Usado para análise de blast radius.

Exemplo:
```yaml
invariant:
  - deterministic-boot
  - retrieval-consistency
```

### `criticality: HIGH | MEDIUM | LOW`

Criticidade do arquivo para o sistema. Default: `HIGH` para `zone: IMMUTABLE`, `MEDIUM` para `PROTECTED`, `LOW` para outros.

## Exemplos

Arquivo de contrato imutável:
```yaml
---
type: contract
immutable: true
zone: IMMUTABLE
criticality: HIGH
invariant:
  - fsm-execution
  - rollback-semantics
---
```

Arquivo operacional mutável:
```yaml
---
type: state
immutable: false
zone: OPERATIONAL
---
```

## Validação

O script `validate-kernel.ps1` verifica:
- Arquivos com `immutable: true` não foram modificados desde o último registro de hash em `IMMUTABLE_KERNEL.md`.
- Overrides são documentados e aprovados.
- Zonas são consistentes.
