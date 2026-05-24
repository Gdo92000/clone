---
type: system
status: active
domain: obsidian
layer: memory
semantic_priority: 3
tags:
  - type/system
  - domain/obsidian
  - tech/rag
created_at: 2026-05-24
updated_at: 2026-05-24
related:
  - RETRIEVAL_RULES
  - GRAPH_HEALTH
  - KNOWLEDGE_DECAY
  - ORPHAN_REPORT
---

# Semantic Scoring

Fórmulas e critérios para pontuação semântica de notas no vault. Usado para retrieval ranking, graph health e priorização de manutenção.

> [!info] Composição
> O score final é composto por 4 dimensões independentes que alimentam o ranking em [[RETRIEVAL_RULES]].

## Score components

| Score | Peso no ranking | Fórmula |
|-------|----------------|---------|
| Semantic score | 40% | `min(semantic_priority × 0.25, 1.0)` |
| Authority score | 30% | `(backlinks / max_backlinks) × 1.0` |
| Backlink score | 20% | `min(backlinks / 10, 1.0)` |
| Density score | 10% | `min(wikilinks_por_nota / 5, 1.0)` |

## Política de notas

Regras para controle de densidade semântica e tamanho de notas:

- **Evitar notas gigantes**: fragmentar notas > 300 linhas em sub-notas atômicas com MOC hub central
- **Preferir atomic notes**: cada nota cobre exatamente um conceito, decisão ou domínio
- **Reduzir redundância**: proibido duplicar informação entre notas. Usar wikilinks em vez de copiar conteúdo.
- **Controlar densidade semântica**: cada parágrafo deve adicionar informação única. Remover conteúdo genérico ou óbvio.

## Authority score

| Tipo | Authority boost | Critério |
|------|----------------|----------|
| MOC | 0.3 | Hub semântico de domínio |
| System note | 0.3 | Infraestrutura de memória |
| Knowledge note | 0.2 | Conhecimento permanente |
| ADR | 0.2 | Decisão arquitetural |
| Worklog | 0.0 | Nota temporária |
| Archived | -0.3 | Nota obsoleta |

## Backlink score

| Backlinks | Score | Interpretação |
|-----------|-------|---------------|
| 0 | 0.0 | Órfã — ver [[ORPHAN_REPORT]] |
| 1-2 | 0.2 | Conexão fraca |
| 3-5 | 0.5 | Conexão moderada |
| 6-10 | 0.8 | Conexão forte |
| 10+ | 1.0 | Authority note |

## Density score

```
density = total_wikilinks / total_lines
```

| Density | Score | Ação |
|---------|-------|------|
| < 0.05 | 0.2 | Baixa — considerar adicionar links |
| 0.05-0.10 | 0.5 | Moderada — aceitável |
| 0.10-0.20 | 0.8 | Boa — ideal |
| > 0.20 | 1.0 | Alta — possível graph pollution |

## Relevance ranking

O ranking composto usado em [[RETRIEVAL_RULES]]:

```
ranking = (semantic_score × 0.4) + (authority_score × 0.3) + (backlink_score × 0.2) + (density_score × 0.1)
```

Ajustes:
- **Recency**: Notas com updated_at > 90 dias: -0.2
- **Decay**: Notas com [[KNOWLEDGE_DECAY]] score > 0.7: excluídas
- **Domain match**: Query domain = note domain: +0.1

## Retrieval weighting

| Scenario | Component weights (s, a, b, d) |
|----------|-------------------------------|
| RAG geral | 0.4, 0.3, 0.2, 0.1 |
| Exploração | 0.3, 0.2, 0.2, 0.3 |
| Manutenção | 0.2, 0.1, 0.4, 0.3 |
| Auditoria | 0.1, 0.1, 0.3, 0.5 |

## Related system notes

- [[RETRIEVAL_RULES]] — Ranking composto aplicado ao retrieval
- [[GRAPH_HEALTH]] — Métricas de conectividade
- [[KNOWLEDGE_DECAY]] — Decay scoring
- [[ORPHAN_REPORT]] — Detecção de notas órfãs
