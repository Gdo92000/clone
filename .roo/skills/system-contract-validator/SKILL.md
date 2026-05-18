---
name: system-contract-validator
description: Esta skill gerencia, valida e aplica conformidade do System Contract arquitetural. Use esta skill sempre que o usuário mencionar "system contract", "arquitetura", "compliance", ".agent/core/", "RT-*", "snapshot", "orchestrator", "invariantes", "camadas L1-L6", "FSM", "governança", ou precisar auditar integridade estrutural do sistema. A skill aplica validação arquitetural, classificação de execução, detecção de violações e governança operacional baseada no contrato do projeto.
compatibility: requires file system access, JSON parsing, markdown processing
---

# System Contract Validator

Esta skill gerencia, valida e enforce o cumprimento do System Contract arquitetural do projeto. Ela garante que todas as execuções sigam rigorosamente as regras definidas em `.agent/core/system-contract.md`.

## Pipeline Obrigatório de Leitura

Leia os arquivos necessários ao escopo da validação atual.  
Para auditorias completas de compliance, siga a ordem de leitura recomendada abaixo.

### LEVEL 1 — BASIC VALIDATION

**Uso:** leitura simples, inspeção, auditoria leve

**Leitura mínima obrigatória:**
1. `.agent/core/system-contract.md` 
2. `.agent/core/bootstrap.md` 

### LEVEL 2 — ARCHITECTURE VALIDATION

**Uso:** alterações estruturais, auditoria arquitetural, validação L1-L6

**Leitura obrigatória:**
1. `.agent/core/system-contract.md` 
2. `.agent/core/bootstrap.md` 
3. `.agent/ARCHITECTURE.md` 
4. `.agent/core/rule-evaluation-engine.md` 
5. `ARQUITETURA.md` 
6. `.agent/core/sec-action-table.md` 
7. `.agent/core/execution-state-machine.md` 
8. `.agent/core/execution-gate.md` 
9. `.agent/core/agent-runtime.md` 
10. `.agent/core/response-interceptor.md` 
11. `AGENTS.md` 
12. `.agent/core/execution-gate.md` 
12. `AGENTS.md` - Instruções de persona

**EXECUÇÃO SEM LEITURA ADEQUADA É PROIBIDA.**

## Critérios de Aceitação

A execução é considerada válida apenas se:

* TASK_CLASS foi definido
* Governance level foi definido
* Arquivos obrigatórios foram carregados
* Nenhum RT-* crítico existe
* Invariantes críticos permanecem íntegros
* Multi-fase foi delegada ao orchestrator
* RT-09 foi produzido
* Snapshot governance foi respeitado
* Pipeline adequado ao escopo
* Contexto otimizado para a tarefas corretamente
- [ ] Status de integridade L1-L6 está OK
- [ ] Pipeline adequado ao escopo da validação
- [ ] Contexto otimizado para a tarefa

### Invariantes Críticos

| Símbolo | Invariante | Diretriz |
| ------- | ----------- | ------- |
| OMEGA | Exclusividade de Domínio | Um arquivo = uma responsabilidade clara |
| PSI | Pureza Epistemológica | Sem mistura domínio/UI |
| LAMBDA | Modularidade Estrutural | Preferencialmente: máx 300 linhas, 5 exports, 20 funções |
| GAMMA | Artifact Granularity | 1 artefato por arquivo |
| XI | Layer Depth & DI | Dependency Injection obrigatória |
| SIGMA | File Ownership | Ownership obrigatório |
| PI | Write Pipeline | safe-write + formatter + validate |
| THETA | Snapshot Imutabilidade | Conteúdo imutável |
| KAPPA | Gateway Central | Inferência centralizada |
| DELTA | CAS Obrigatório | compare_and_swap obrigatório |
| RHO | Bounded Queues | Queue limitada |
| OMEGA2 | Trace Propagation | trace_id obrigatório |
| OMEGA3 | Telemetria Bifurcada | Runtime separado |
| IOTA | Idempotência | Reexecução segura |
| PHI | Recovery Determinístico | Snapshot consistente |

## Decision Matrix

| Cenário | Ação Recomendada |
|---|---|
| Violação crítica | STOP-WORK imediato |
| Violação recuperável | SOFT-BLOCK + retomar estado anterior |
| Snapshot expirado | Recovery Flow com snapshot consistente |
| Pipeline incompleto | Revalidar bootstrap e continuar |
| Multi-fase sem orchestrator | Delegar para orchestrator |
| Contexto excessivo | Reduzir contexto e reavaliar |

## Detecção de Violações RT-*

### Violações Críticas (STOP-WORK)

- **RT-INF**: Inferência fora do gateway central
- **RT-GEN**: Uso de agente generalista fora do estado IDLE
- **RT-SKILL**: Skill inválida ou inexistente
- **RT-SNAP**: Snapshot inválido, hash divergente, lease expirado
- **RT-ARCH**: Violação de arquitetura (camada, bounded context)
- **RT-AUTH**: Falha de identificação de especialidade do agente
- **RT-PIPE**: Pipeline incompleto
- **RT-ORCH**: Multi-fase sem orchestrator

### Violações Altas (SOFT-BLOCK)

- **RT-BUDGET**: Budget excedido
- **RT-CAS**: CAS falhou
- **RT-QUEUE**: Overflow
- **RT-CTX**: Contexto excessivo
- **RT-RETRY**: Retry indevido (erro não transiente, acima do limite)

### Formato de Log RT-09

Toda resposta deve conter este log obrigatório:

```
╔════════════════════════════════════════════════════════════╗
║ AGENTE EXECUTOR: {agent_name}                                    ║
║ TAREFA: {task_description}                                   ║
║ MODO: {DIRECT_EXECUTION | STATE_MACHINE_EXECUTION}             ║
║ FASE: {fase_da_fsm}                                      ║
║ SKILLS: [{skill_1}, {skill_2}, ...]                        ║
║ CAMADAS: [{layer_1}, {layer_2}, ...]                       ║
║ TRACE_ID: {trace_id}                                        ║
║ SPAN_ID: {span_id}                                          ║
║ SNAPSHOT_VERSION: {snapshot_version}                            ║
║ REQUEST_ID: {request_id | null}                               ║
║ CHAT_SESSION_ID: {chat_session_id | null}                        ║
║ CHAT_REQUEST_ID: {chat_request_id | null}                        ║
║ EXECUTION_MODE: {CHAT_RUNTIME | GOVERNED_INFERENCE}          ║
║ TOKEN_USAGE_RUNTIME: {number}                                  ║
║ TOKEN_USAGE_GOVERNED: {number}                                 ║
╚══════════════════════════════════════════════════════════╝
```

## Gerenciamento de Snapshot

### Validação de Snapshot

- Verificar hash do conteúdo
- Validar lease epoch
- Confirmar que conteúdo está imutável
- Apenas orchestrator pode modificar lease_meta

### Ciclo de Vida

1. **Criação**: Gerado por L4 ou orchestrator
2. **Ativo**: Conteúdo imutável, lease renovável
3. **Expirado**: SOFT-BLOCK para novos consumidores
4. **Recovery**: Retomada do último snapshot consistente

## Orquestração Multi-fase

### Regra MFOR (Multi-fase Orchestration Rule)

Toda tarefa com múltiplas fases DEVE passar pelo orchestrator:

```
User Request -> orchestrator -> classificar(TASK_CLASS) -> planejar(fases) -> coordenar(agentes) -> consolidar(CAS) -> validar(resultado)
```

### Delegação de Fases

- **análise** -> agente `debugger`
- **correção/Write** -> agente especializado pelo domínio
- **validação** -> agente `test-engineer`

### Abortamento Obrigatório

Se tarefa envolve múltiplas fases e agente atual ≠ `orchestrator`:
→ EXECUTAR STOP-WORK com RT-ORCH

## Relatórios de Compliance

### Status Report

Gerar relatório estruturado com:

```json
{
  "timestamp": "2025-01-XX...",
  "integrity_status": "OK|VIOLATION",
  "layers_affected": ["L6", "L5"],
  "invariantes_violated": ["OMEGA", "PSI"],
  "rt_violations": ["RT-ARCH", "RT-PIPE"],
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "recommendations": ["item1", "item2"]
}
```

### Executive Summary

Para violações críticas, fornecer resumo executivo com:
- Status atual de integridade
- Violações detectadas
- Impacto no sistema
- Ações imediatas requeridas
- Timeline para correção

## Scripts de Validação

### check-core-files.js
Valida existência e integridade dos 12 arquivos core

### validate-invariants.js
Verifica aderência aos invariantes do sistema

### detect-violations.js
Identifica e classifica violações RT-*

### generate-report.js
Produz relatórios de compliance no formato especificado

## Fluxo de Trabalho

1. **Bootstrap**: Ler pipeline obrigatório
2. **Validate**: Verificar integridade e invariantes
3. **Detect**: Identificar violações
4. **Report**: Gerar relatórios
5. **Enforce**: Aplicar ações corretivas
6. **Monitor**: Observação contínua

Use esta skill sempre que precisar garantir conformidade com o System Contract ou quando trabalhar com a arquitetura do sistema.
