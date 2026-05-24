---
type: system
status: active
domain: obsidian
layer: memory
semantic_priority: 4
tags:
  - type/system
  - domain/obsidian
  - tech/rag
created_at: 2026-05-24
updated_at: 2026-05-24
related:
  - RETRIEVAL_RULES
  - SEMANTIC_INDEX
  - SEMANTIC_SCORING
---

# Vector Search

Estratégia de embeddings, busca vetorial local, semantic indexing e retrieval pipeline para o vault Obsidian.

> [!info] Abordagem
> O vault prioriza busca semântica baseada em grafo (wikilinks + MOCs) sobre busca vetorial pura. Esta nota documenta a estratégia híbrida.

## Embeddings

| Propriedade | Valor |
|------------|-------|
| Modelo | Determinar conforme disponibilidade (ex: text-embedding-3-small, all-MiniLM-L6-v2) |
| Dimensão | 384-1536 |
| Granularidade | Por nota (não por parágrafo) para notes < 200 linhas |
| Atualização | A cada nota nova ou editada |

## Semantic indexing strategy

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│ Raw note     │  →  │ Wikilink     │  →  │ Embedding     │  →  │ Vector store  │
│ (markdown)   │     │ graph        │     │ generation    │     │ (index)       │
└─────────────┘     └──────────────┘     └───────────────┘     └──────────────┘
       │                   │                      │                     │
       │                   │                      │                     │
       ▼                   ▼                      ▼                     ▼
  Chunk + clean    Extract MOC +          Encode via          Store with
  frontmatter      authority context      embedding model     metadata
```

## Chunk sizing

| Nota | Tamanho | Motivo |
|------|---------|--------|
| < 50 linhas | Nota inteira | Baixo custo, contexto completo |
| 50-200 linhas | Nota inteira | Ideal para atomic notes |
| 200-500 linhas | 2-3 chunks | Divisão por headings h2 |
| > 500 linhas | 4+ chunks | Divisão por seções (giant note) |

## Retrieval pipeline

```
query → domain filter → MOC filter → semantic search → rank → context assembly
```

1. **Domain filter**: Extrair domínio da query, filtrar notas pelo `domain` no frontmatter
2. **MOC filter**: Identificar MOC relevante, buscar notas linked ao MOC
3. **Semantic search**: Busca vetorial por similaridade de embedding
4. **Rank**: Aplicar [[RETRIEVAL_RULES]] ranking composto
5. **Context assembly**: Montar contexto com notas ranked, respeitando chunk limits

## Semantic search strategy

| Estratégia | Quando usar | Efetividade |
|------------|-------------|-------------|
| Graph-only | Query curta, domínio claro | Alta para domínios bem conectados |
| Vector-only | Query difusa, sem domínio específico | Média (depende do modelo) |
| Híbrido (graph + vector) | Caso geral | **Alta** (recomendado) |
| MOC-first | Query de descoberta (explore) | Alta para visão geral |

## Related system notes

- [[RETRIEVAL_RULES]] — Ranking e heurísticas de retrieval
- [[SEMANTIC_INDEX]] — Authority notes e MOCs
- [[SEMANTIC_SCORING]] — Scoring weights para ranking
