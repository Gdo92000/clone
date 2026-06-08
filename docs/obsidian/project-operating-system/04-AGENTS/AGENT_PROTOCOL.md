---
type: guide
status: draft
domain: agents
layer: L1
semantic_priority: 5
tags:
  - type/guide
  - domain/agents
  - tech/protocol
aliases:
  - Agent Protocol
  - Crash-Safe Recovery
  - Validação Obrigatória
supersedes:
  - AGENTS.md sections (Execução obrigatória, Critério de conclusão, Crash-Safe)
created_at: 2026-05-26
updated_at: 2026-05-27
---

# AGENT EXECUTION PROTOCOL

## EXECUTION PHASES

Mandatory execution order:

1. Read documentation
2. Analyze current state
3. Detect constraints
4. Produce implementation plan
5. Validate contracts
6. Implement
7. Run tests
8. Run audit
9. Deliver

---

## BEFORE IMPLEMENTING

The agent must:

- Read architecture rules
- Read folder structure
- Read contracts
- Validate dependencies
- Detect conflicting implementations

---

## IMPLEMENTATION RULES

Mandatory:

- Full files only
- No pseudo-code
- No TODO placeholders
- No hidden assumptions
- No partial refactors
- Preserve compatibility unless approved

---

## VALIDATION RULES

Before delivery:

- Syntax validation
- Type validation
- Import validation
- Build validation
- Test validation
- Architecture validation

---

## AUDIT RULES

The agent must report:

- Violations
- Risks
- Missing tests
- Architectural drift
- Performance risks
- Security risks

---

## FAILURE HANDLING

If ambiguity exists:

- Stop execution
- Request clarification
- Do not invent business rules

---

## EXECUÇÃO OBRIGATÓRIA

> Toda alteração deve seguir:
> 1. alterar código
> 2. executar lint
> 3. executar typecheck
> 4. executar testes afetados
> 5. validar build
> 6. somente então concluir tarefa

> É proibido declarar sucesso sem validação executada.

## CRITÉRIO DE CONCLUSÃO

Uma tarefa só pode ser considerada concluída quando:
- lint = sem erros
- TypeScript = sem erros
- build = sucesso
- testes afetados = sucesso
- sem warnings críticos
- sem regressão arquitetural

## CRASH-SAFE RECOVERY

### Estrutura de recovery
```
docs/obsidian/worklog/
├── active/CURRENT_TASK.md
├── checkpoints/LAST_CHECKPOINT.md
└── recovery/
    ├── RECOVERY_QUEUE.md
    ├── PARTIAL_CHANGES.md
    └── ROLLBACK_STATE.md
```

### Quando ativar
Toda tarefa que altere código, tenha múltiplas etapas, dure > 5 min, modifique arquitetura ou execute migração.

### Recovery após crash
1. Ler `STATE_ACTIVA.md` (gerado — fases ativas)
2. Ler `MEMORY.md` (decisões e lessons)
3. Ler `CURRENT_STATE.md` (view histórica, sob demanda)
4. Ler `worklog/active/CURRENT_TASK.md`
5. Ler `worklog/checkpoints/LAST_CHECKPOINT.md`
6. Detectar tarefas interrompidas
7. Perguntar: "Deseja continuar do checkpoint?"

### Regras de integridade
- Nunca assumir conclusão sem validação
- Nunca deixar estado parcialmente desconhecido
- Nunca sobrescrever checkpoint sem consolidar anterior
- Toda alteração parcial deve ser rastreável

Após retomada: validar TypeScript, imports, build parcial, consistência arquitetural.

---

## OUTPUT FORMAT

Required:

- Objective
- Files changed
- Risks
- Validation results
- Remaining gaps

## Relações

- [[_index|04-AGENTS Index]]
- [[00-SYSTEM/SYSTEM_CONTRACT|System Contract]]
- [[CURRENT_STATE]] — Estado a ser lido
- [[MEMORY]] — Memória a ser consultada
