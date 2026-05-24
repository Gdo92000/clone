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
  - SEMANTIC_INDEX
  - SEMANTIC_SCORING
  - VECTOR_SEARCH
  - KNOWLEDGE_DECAY
  - MEMORY_LIFECYCLE
---

# Retrieval Rules

Regras de retrieval ranking, semantic priority, authority scoring, chunking strategy, compatibilidade com IA/RAG e práticas de ingestão semântica.

> [!warning] Source of truth
> Estas regras definem a ordem de retrieval. Sempre consultar antes de executar RAG.

## Retrieval ranking

A ordem de retrieval segue a pontuação composta:

```
ranking = (semantic_priority × 0.4) + (authority_score × 0.3) + (backlink_score × 0.2) + (recency_score × 0.1)
```

| Fator | Peso | Fonte |
|-------|------|-------|
| semantic_priority | 40% | Frontmatter da nota |
| authority_score | 30% | [[SEMANTIC_SCORING]] |
| backlink_score | 20% | Contagem de backlinks |
| recency_score | 10% | updated_at |

## Semantic priority tiers

| Prioridade | Tipo de nota | Exemplos |
|------------|-------------|----------|
| 5 (crítica) | MOCs, AGENTS.md, System Index, MEMORY, CURRENT_STATE | [[MOC Architecture]], [[CURRENT_STATE]] |
| 4 (alta) | Authority notes, knowledge notes | [[Authentication Flow]], [[Estrutura do Backend]] |
| 3 (média) | Worklogs, ADRs, notas operacionais | [[Fase 18 — Snapshot Fixtures]] |
| 2 (baixa) | Notas arquivadas, rascunhos | [[Session Memory]] |
| 1 (mínima) | Notas obsoletas (ver [[KNOWLEDGE_DECAY]]) | Notas com decay score alto |

## Authority scoring

Authority notes recebem bônus de retrieval:

- **MOCs**: +0.2 no ranking (são hubs semânticos)
- **System notes**: +0.3 no ranking (infraestrutura de memória)
- **Notas com ≥5 backlinks**: +0.1 no ranking (validação por pares)
- **Notas com domain/core**: +0.2 no ranking (domínio central)

## Chunking strategy

| Tipo de nota | Tamanho de chunk | Overlap |
|-------------|------------------|---------|
| MOCs | 100-200 linhas | 10% |
| Knowledge notes | 50-150 linhas | 15% |
| Worklogs | 30-80 linhas | 20% |
| ADRs | 50-100 linhas | 10% |
| Component notes | 30-60 linhas | 15% |
| System notes | 50-150 linhas | 10% |

## Retrieval heuristics

1. **Domínio primeiro**: Filtrar por `domain` no frontmatter antes de buscar
2. **MOC como entry point**: Sempre começar retrieval pelo MOC do domínio
3. **Authority boost**: Notas marcadas como authority têm precedência
4. **Recency cutoff**: Notas não atualizadas há >90 dias recebem -0.2 no ranking
5. **Respeitar decay**: Notas com decay score >0.7 são excluídas do retrieval ([[KNOWLEDGE_DECAY]])

## Compatibilidade com IA/RAG

Otimizações para recuperação eficiente por sistemas de IA e RAG:

- **Embeddings**: conteúdo deve ser semanticamente denso — frases curtas, vocabulário consistente, evitar floreios
- **Semantic search**: usar termos precisos e consistentes entre notas (ex: sempre "delivery", não alternar "entrega" / "shipping")
- **Retrieval**: notas atômicas (< 200 linhas) são preferíveis para chunking eficiente sem perda de contexto
- **Token economy**: evitar boilerplate, cabeçalhos redundantes, listas vazias, seções placeholder
- **Context compression**: priorizar informação em formato estruturado (tabelas, listas chave-valor) sobre prosa extensa

## RAG-safe architecture

Práticas para garantir que o vault seja seguro e eficiente para sistemas RAG:

- **Evitar contexto inútil**: notas devem ser auto-contidas mas sem re-explicar conceitos óbvios ou já definidos em canonical references
- **Evitar boilerplate excessivo**: sem cabeçalhos vazios, seções placeholder, repetição de template notes
- **Evitar links artificiais**: wikilinks devem refletir conexões semânticas reais, não ser forçados para cumprir métrica de backlinks
- **Priorizar semantic density**: cada nota deve maximizar relação informação/token. Preferir sentenças concisas a prosa explicativa.
- **Evitar ambiguidade**: usar vocabulário consistente. Termos equivalentes (ex: "order" vs "pedido") devem ser padronizados no vault.

## Defuddle integration (importação semântica)

Conteúdo importado da web (documentação, artigos, blog posts) deve ser limpo semanticamente antes de incorporar ao vault:

- Usar skill "defuddle" para extrair markdown limpo de URLs
- Remover navegação, cabeçalhos repetidos, CTAs e boilerplate antes de incorporar
- Extrair apenas o conteúdo semanticamente relevante para o contexto do projeto
- Sempre atribuir fonte original no frontmatter (`source:`)
- Adaptar terminologia para manter consistência semântica com o vault

## Contextual recall

Para reconstruir contexto entre sessões:

1. Carregar [[CURRENT_STATE]] para estado atual
2. Carregar [[MEMORY]] para contexto consolidado
3. Carregar MOC do domínio afetado
4. Carregar authority notes relevantes
5. Aplicar ranking scoring para notas restantes

## Related system notes

- [[SEMANTIC_INDEX]] — Authority notes catalog
- [[SEMANTIC_SCORING]] — Fórmulas detalhadas de score
- [[VECTOR_SEARCH]] — Embedding pipeline
- [[KNOWLEDGE_DECAY]] — Decay scoring e cutoff
- [[MEMORY_LIFECYCLE]] — Ciclo de vida da memória
