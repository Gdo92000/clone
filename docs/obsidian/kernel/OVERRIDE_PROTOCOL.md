---
type: protocol
status: active
domain: kernel
layer: L0
immutable: true
zone: IMMUTABLE
semantic_priority: 5
tags:
  - protocol/override
  - governance/critical
created_at: 2026-05-28
updated_at: 2026-05-28
---

# Override Protocol

Protocolo obrigatório para alterar arquivos do kernel em zonas `IMMUTABLE` ou `PROTECTED`.

## Trigger

Qualquer tentativa de modificar um arquivo com `immutable: true` ou `zone: PROTECTED` deve primeiro passar por este protocolo.

## Steps

1. **Interrupção automática**
   - O agente/ferramenta que detecta a intenção de modificar um arquivo protegido deve interromper a execução automática.
   - Retornar `MUTATION_DENIED` e explicar a política de kernel.

2. **Explicação de impacto**
   - Listar os arquivos que seriam afetados.
   - Descrever a mudança proposta em uma frase.
   - Explicar por que a mudança é necessária.

3. **Análise de dependências**
   - Enumerar todos os arquivos que dependem do arquivo alvo (uso `grep`, análise de imports, referências).
   - Identificar outros arquivos protegidos que seriam impactados.
   - Estimar blast radius.

4. **Invariantes afetados**
   - Listar invariantes definidos no `IMMUTABLE_KERNEL.md` ou `SCHEMA.md` que esta mudança pode violar.
   - Propor mitigações.

5. **Solicitação de confirmação explícita**
   - Se a análise mostrar risco alto, exigir aprovação manual (simulada ou humana).
   - Se aprovado, gerar um arquivo de override em `docs/obsidian/kernel/overrides/` com nome `YYYY-MM-DD_HHMMSS_<desc>.md`.
   - Nesse arquivo, registrar:
     - Timestamp
     - Autor
     - Arquivos modificados (com diff sumário)
     - Motivação
     - Impacto
     - Dependências
     - Invariantes afetados e como foram preservados
     - Comando de rollback (ex: git checkout <commit>)
     - Status: APROVADO | REJEITADO
   - Atualizar `log.md` do kernel com a tentativa e resultado.

6. **Aplicação**
   - Com o override documentado, a modificação pode prosseguir.
   - O arquivo modificado deve conter no frontmatter `override: overrides/<arquivo>.md` (opcional, para rastreabilidade).
   - Atualizar o hash em `IMMUTABLE_KERNEL.md` se o arquivo for `immutable: true` e a mudança foi aprovada (cuidado: isso altera o kernel).

## Formato do Override Request

```markdown
---
title: "Override: Timeout de agentes aumentado de 30s para 60s"
date: 2026-05-28T14:30:00Z
author: Claude Code
status: APPROVED
files:
  - path: docs/obsidian/project-operating-system/00-SYSTEM/AGENT_TIMEOUTS.md
    reason: "Aumentar timeout para operações longas"
impact:
  - "AGE dependence: atualiza 04-AGENTS/CAPABILITY_DISCOVERY.md"
  - "Invariant 'quick-response': mitigado com configuração por perfil"
rollback:
  - "git checkout <commit_anterior>"
diff:
  - "- timeout: 30s"
  - "+ timeout: 60s"
---
```

## Recusa Automática

Se o protocolo não for seguido, o sistema deve:
- Bloquear a escrita no arquivo (git hook, pre-commit, validação).
- Retornar erro claro: `KERNEL_OVERRIDE_REQUIRED` com link para este protocolo.

## Exceções

Nenhuma exceção em produção. Em ambiente de desenvolvimento local, pode-se desabilitar a validação configurando `KERNEL_ENFORCEMENT=disabled` no ambiente, mas isso deve ser raro e auditado.

## Audit

Todos os overrides são auditáveis via:
- `overrides/` diretório (documentos de override)
- `log.md` (log cronológico)
- Git history (difusão)

## Responsabilidade

Qualquer agente, script ou humano que modificar código deve respeitar este protocolo. A memória operacional (`MEMORY.md`) pode ser usada para discutir overrides antes de executá-los.
