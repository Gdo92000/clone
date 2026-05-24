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
  - GRAPH_HEALTH
  - ORPHAN_REPORT
  - SEMANTIC_SCORING
  - SEMANTIC_INDEX
---

# Auto Linking

Heurísticas e regras para linking automático entre notas do vault. Mantém densidade semântica sem criar graph pollution.

> [!warning] Anti-artificial-linking
> Links devem refletir conexões semânticas REAIS. Nunca adicionar links apenas para cumprir métrica.

## Regras de linking (MOC)

- Toda nota deve possuir contexto semântico explícito (ao menos um wikilink para MOC ou authority note)
- Evitar backlinks artificiais — links devem refletir conexões semânticas reais
- Priorizar semantic density sobre quantidade de links
- Evitar graph pollution — notas sem valor semântico não devem ser conectadas
- Clusters desconectados devem ser reconectados a um MOC ou arquivados
- Reduzir notas órfãs a zero — notas sem backlinks de entrada devem ser linkadas a MOC ou movidas para archive

## Backlink heuristics

| Heurística | Critério | Prioridade |
|------------|----------|------------|
| Domain match | Notas do mesmo `domain:` no frontmatter | Alta |
| MOC parent-child | Nota linked ao MOC do seu domínio | Alta |
| Term overlap | Título da nota aparece em outra nota | Média |
| Cross-reference | Nota A menciona conceito definido na Nota B | Alta |
| Chronological | Worklogs da mesma fase | Média |

## Semantic linking rules

```
NOTA_A (domain: delivery) → deve linkar → MOC_Delivery_Flow (hub do domínio)
NOTA_A (domain: delivery) → deve linkar → authority_notes de delivery
NOTA_A (domain: delivery) → pode linkar → NOTA_B (domain: delivery)
NOTA_A (domain: delivery) → não linkar → NOTA_C (domain: unrelated)
```

| Regra | Obrigatória? | Exceção |
|-------|-------------|---------|
| Toda nota linka seu MOC de domínio | Sim | Notas em `archive/` |
| MOC linka todas as notas do seu domínio | Sim | Notas órfãs em reparo |
| Authority notes linkam entre si | Sim | Domínios diferentes |
| Notas do mesmo domínio linkam entre si | Não | Apenas se conteúdo relacionado |
| Notas de domínios diferentes linkam | Não | Apenas se cross-reference explícita |

## Automatic connection rules

Ações automáticas na criação de nova nota:

1. **Extrair domínio** do frontmatter
2. **Encontrar MOC** correspondente via [[SEMANTIC_INDEX]]
3. **Adicionar wikilink** no MOC para a nova nota
4. **Adicionar wikilink** na nova nota para o MOC
5. **Detectar termos** overlap com notas existentes
6. **Sugerir links** para notas com domain match

Configuração:

```yaml
auto_linking:
  mandatory:
    - domain_to_moc: true
    - moc_to_child: true
  optional:
    - term_overlap: true
    - cross_reference: true
  forbidden:
    - unrelated_domains: true
    - artificial_backlinks: true
```

## Anti-artificial-linking rules

> [!danger] Graph pollution
> Links artificiais degradam a qualidade do grafo semântico. Sempre questionar: esta conexão é real?

| Prática proibida | Razão |
|-----------------|-------|
| Linkar MOC sem conteúdo relacionado | Infla backlinks sem valor semântico |
| Linkar toda nota do mesmo diretório | Agrupamento estrutural, não semântico |
| Adicionar links para cumprir métrica | Cria graph pollution |
| Duplicar links (Nota A → B e B → A sem necessidade) | Redundância sem ganho |

## Semantic density preservation

Para manter densidade semântica ideal (0.10-0.20 wikilinks/linha):

| Densidade | Interpretação | Ação |
|-----------|---------------|------|
| < 0.05 | Muito baixa | Adicionar links para MOC e authority notes |
| 0.05-0.10 | Baixa | Considerar links para notas relacionadas |
| 0.10-0.20 | **Ideal** | Manter |
| 0.20-0.35 | Alta | Verificar graph pollution |
| > 0.35 | Muito alta | Revisar necessidade de cada link |

## Related system notes

- [[GRAPH_HEALTH]] — Métricas de conectividade
- [[ORPHAN_REPORT]] — Detecção de notas sem backlinks
- [[SEMANTIC_SCORING]] — Density score como métrica de qualidade
- [[SEMANTIC_INDEX]] — Authority notes e MOCs catalog
