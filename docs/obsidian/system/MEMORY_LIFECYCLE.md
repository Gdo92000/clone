---
type: system
status: active
domain: obsidian
layer: memory
semantic_priority: 5
tags:
  - type/system
  - domain/obsidian
  - tech/rag
created_at: 2026-05-24
updated_at: 2026-05-24
related:
  - KNOWLEDGE_DECAY
  - SEMANTIC_INDEX
  - ORPHAN_REPORT
  - RETRIEVAL_RULES
---

# Memory Lifecycle

Ciclo de vida completo da memória operacional no vault Obsidian. Define estágios, regras de consolidação, transição, retenção e sessão recovery avançado.

> [!example] Fluxo de maturação
> Temporary → Operational → Permanent → Archived

## Estágios

| Estágio | Diretório | Duração | Critério de promoção |
|---------|-----------|---------|----------------------|
| **Temporary** | `worklog/` | < 30 dias | Informação relevante para execução futura |
| **Operational** | `MEMORY` + `CURRENT_STATE` | Sessão atual | Necessário para continuidade entre sessões |
| **Permanent** | `knowledge/`, `adr/`, `mocs/`, `system/` | Indefinido | Conhecimento duradouro ou decisão arquitetural |
| **Archived** | `archive/` | Permanente | Obsoleto mas preservado para rastreabilidade |

## Regras de consolidação

> [!important] Consolidação obrigatória
> Ao final de cada sessão, consolidar informações temporárias antes de limpar CURRENT_STATE.

| Gatilho | Ação | Destino |
|---------|------|---------|
| Worklog fechado > 30 dias | Arquivar | `archive/` |
| Decisão arquitetural tomada | Criar ADR | `adr/` |
| Padrão identificado (3+ ocorrências) | Criar knowledge note | `knowledge/` |
| Bug complexo resolvido | Registrar em worklog | `worklog/` |
| Fase concluída | Atualizar MEMORY | `MEMORY.md` |

## Retention policy

| Tipo de nota | Retenção mínima | Ação após expirar |
|-------------|-----------------|-------------------|
| ADRs | Permanente | Nunca deletar |
| MOCs | Permanente | Revisar anualmente |
| Knowledge notes | 12 meses | Revisar, atualizar ou arquivar |
| System notes | Permanente | Revisar semestralmente |
| Worklogs | 30 dias | Arquivar ou promover |
| CURRENT_STATE | Sessão atual | Consolidar e limpar |
| MEMORY | Permanente | Atualizar a cada sessão |

## Session recovery avançado

Além do recovery básico (agendado em [[AGENTS|AGENTS.md]]), manter registro de:

- **Active contexts**: tópicos ou investigações em andamento (registrar em [[CURRENT_STATE]])
- **Pending reasoning chains**: cadeias de raciocínio não concluídas (worklog temporário com tag `type/semantic-checkpoint`)
- **Semantic checkpoints**: decisões parciais ou descobertas intermediárias (worklog com tag `type/semantic-checkpoint`)
- **Unresolved investigations**: bugs ou questões não resolvidas (worklog com status `open`)

Estrutura estendida de recovery no início de cada sessão:
1. Ler [[CURRENT_STATE]] — verificar active contexts e pending chains
2. Ler [[MEMORY]] — contexto consolidado do projeto
3. Verificar `worklog/` por semantic checkpoints e investigações abertas
4. Restaurar reasoning chains a partir de checkpoints encontrados
5. Se [[CURRENT_STATE]] indicar task em andamento, oferecer continuidade

## Workflow de transição

```
Temporary ──(relevante?)──→ Operational ──(duradouro?)──→ Permanent ──(obsoleto?)──→ Archived
     │                           │                             │                     │
     ▼                           ▼                             ▼                     ▼
  worklog/                 MEMORY.md                    knowledge/               archive/
                           CURRENT_STATE                adr/
                                                        mocs/
                                                        system/
```

## Relação com outros sistemas

| Sistema | Integração |
|---------|------------|
| [[KNOWLEDGE_DECAY]] | Decay scoring decide quando Permanent → Archived |
| [[ORPHAN_REPORT]] | Notas arquivadas sem backlinks são sinalizadas |
| [[SEMANTIC_INDEX]] | Authority notes são sempre Permanent |
| [[RETRIEVAL_RULES]] | Recency cutoff e ranking priorizam notas ativas |

## Related system notes

- [[KNOWLEDGE_DECAY]] — Política de envelhecimento e arquivamento
- [[SEMANTIC_INDEX]] — Catálogo de authority notes
- [[ORPHAN_REPORT]] — Detecção de notas órfãs
- [[RETRIEVAL_RULES]] — Prioridade de retrieval baseada em ciclo de vida
