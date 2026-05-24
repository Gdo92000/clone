---
type: system
status: active
domain: obsidian
layer: memory
semantic_priority: 5
tags:
  - type/index
  - type/system
  - domain/obsidian
  - tech/rag
aliases:
  - System Index
  - Semantic Intelligence Index
created_at: 2026-05-24
updated_at: 2026-05-24
related:
  - SEMANTIC_INDEX
  - GRAPH_HEALTH
  - RETRIEVAL_RULES
  - VECTOR_SEARCH
  - MEMORY_LIFECYCLE
  - SEMANTIC_SCORING
  - ORPHAN_REPORT
  - KNOWLEDGE_DECAY
  - AUTO_LINKING
---

# System Index

Índice central do Semantic Intelligence System — infraestrutura de memória semântica operacional para IA/RAG, continuidade contextual e recuperação inteligente.

> [!tip] Hub semântico
> Todas as system notes estão interligadas. Use este índice como entry point.

## Catálogo

| Nota | Prioridade | Descrição |
|------|-----------|-----------|
| [[SEMANTIC_INDEX]] | ⭐ 5 | Hub central — mapa do grafo, authority notes, clusters |
| [[GRAPH_HEALTH]] | ⭐ 5 | Métricas de integridade do grafo semântico |
| [[RETRIEVAL_RULES]] | ⭐ 4 | Ranking de retrieval, scoring e chunking |
| [[VECTOR_SEARCH]] | ⭐ 4 | Embeddings, busca vetorial e pipeline semântico |
| [[MEMORY_LIFECYCLE]] | ⭐ 5 | Ciclo de vida da memória (temporary → permanent) |
| [[SEMANTIC_SCORING]] | ⭐ 3 | Fórmulas de score semântico e autoridade |
| [[ORPHAN_REPORT]] | ⭐ 4 | Detecção e reconexão de notas órfãs |
| [[KNOWLEDGE_DECAY]] | ⭐ 3 | Política de envelhecimento e arquivamento |
| [[AUTO_LINKING]] | ⭐ 3 | Heurísticas de linking automático semântico |

## Mapa de dependências

```
SEMANTIC_INDEX ←── todos os system notes
GRAPH_HEALTH ←── ORPHAN_REPORT, SEMANTIC_SCORING, AUTO_LINKING
RETRIEVAL_RULES ←── SEMANTIC_SCORING, VECTOR_SEARCH
VECTOR_SEARCH ←── RETRIEVAL_RULES
MEMORY_LIFECYCLE ←── KNOWLEDGE_DECAY
SEMANTIC_SCORING ←── RETRIEVAL_RULES, GRAPH_HEALTH, KNOWLEDGE_DECAY
ORPHAN_REPORT ←── GRAPH_HEALTH, AUTO_LINKING
KNOWLEDGE_DECAY ←── MEMORY_LIFECYCLE, SEMANTIC_SCORING
AUTO_LINKING ←── GRAPH_HEALTH, ORPHAN_REPORT, SEMANTIC_SCORING
```

## Related MOCs

- [[MOC Obsidian System]] — Sistema de memória operacional
- [[MOC RAG]] — Retrieval-Augmented Generation
