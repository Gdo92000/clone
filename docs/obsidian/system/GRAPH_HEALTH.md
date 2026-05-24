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
  - SEMANTIC_INDEX
  - ORPHAN_REPORT
  - SEMANTIC_SCORING
  - AUTO_LINKING
  - KNOWLEDGE_DECAY
---

# Graph Health

Métricas de integridade do grafo semântico do vault. Regras para manter o grafo saudável, monitorar conectividade, detectar orphan notes, broken links, graph pollution e densidade.

> [!important] Alvo
> Conectividade ≥ 9/10. Weighted resolution ≥ 95%. Zero orphan notes.

## Integridade do grafo semântico

Regras para manter o grafo saudável:

- **Orphan notes**: zero tolerância. Toda nota deve ter ao menos 1 backlink de entrada de outra nota.
- **Backlinks mínimos**: notas de conhecimento devem ter ≥2 backlinks. Notas de worklog ≥1.
- **Clusters desconectados**: clusters isolados do grafo principal devem ser reconectados ou arquivados em `archive/`.
- **Hubs semânticos**: MOCs e `_index.md` funcionam como hubs centrais. Toda nota deve ser acessível a partir de um hub em ≤3 hops.
- **Graph pollution**: evitar notas que não adicionam densidade semântica. Preferir mesclar conteúdo relevante em notas existentes.
- **Verificação**: analisar grafo a cada milestone — métrica alvo: conectividade ≥9/10, weighted resolution ≥95%.

## Métricas principais

| Indicador | Alvo | Fórmula |
|-----------|------|---------|
| Connectivity score | ≥ 9/10 | `(total_links / total_notes) * 2` |
| Weighted resolution | ≥ 95% | `(resolved_links / total_links) * 100` |
| Orphan notes | 0 | Count de notas sem backlinks |
| Broken wikilinks | 0 | Count de `[[nota_inexistente]]` |
| Graph density | ≥ 0.15 | `(2 * total_links) / (total_notes * (total_notes - 1))` |
| Disconnected clusters | 0 | Clusters isolados do grafo principal |

## Auditoria periódica

Auditoria a cada milestone para verificar:

| Indicador | Alvo | Ação corretiva |
|-----------|------|----------------|
| Orphan notes | 0 | Adicionar backlink ou arquivar |
| Broken wikilinks | 0 | Corrigir target ou remover link |
| Duplicated notes | 0 | Mesclar conteúdo ou redirecionar via wikilink |
| Semantic fragmentation | < 5% | Consolidar notas relacionadas em conhecimento unificado |
| Redundant tags | 0 | Normalizar para taxonomia oficial |
| Weak connectivity | ≥ 1 backlink/nota | Adicionar links semânticos a partir de hubs |
| Score conectividade | ≥ 9/10 | Verificar clusters, hubs e backlinks faltantes |

### Workflow de auditoria

| Etapa | Ação | Ferramenta |
|-------|------|------------|
| 1 | Escanear orphan notes | [[ORPHAN_REPORT]] |
| 2 | Detectar broken wikilinks | Validação manual ou script |
| 3 | Calcular connectivity score | Contagem de links ÷ notas |
| 4 | Identificar clusters | Análise de componentes conectados |
| 5 | Verificar graph pollution | Revisão de notas sem densidade semântica |
| 6 | Gerar relatório | Atualizar [[ORPHAN_REPORT]] |

## Problemas comuns e correções

| Problema | Causa | Correção |
|----------|-------|----------|
| Orphan note | Nota sem backlinks de entrada | Adicionar wikilink de MOC ou authority note |
| Broken link | Wikilink para nota inexistente | Corrigir target ou remover link |
| Cluster isolado | Grupo de notas sem conexão com hubs centrais | Adicionar links para MOC ou System Index |
| Graph pollution | Notas com baixa densidade semântica | Mesclar em nota existente ou arquivar |
| Baixa conectividade | Poucos backlinks por nota | Executar [[AUTO_LINKING]] heuristics |

## Histórico de conectividade

| Data | Score | Resolução | Órfãs | Clusters |
|------|-------|-----------|-------|----------|
| 2026-05-23 | 10/10 | 99.6% | 0 | 1 |
| 2026-05-24 | 10/10 | 100% | 0 | 1 |

> [!tip] Baseline
> Score atual: 10/10. Manter através de auditorias regulares e [[AUTO_LINKING]].

## Related system notes

- [[SEMANTIC_INDEX]] — Mapa completo do grafo
- [[ORPHAN_REPORT]] — Detecção detalhada de órfãs
- [[SEMANTIC_SCORING]] — Fórmulas de score
- [[AUTO_LINKING]] — Heurísticas de linking automático
- [[KNOWLEDGE_DECAY]] — Decay e archive de notas degradadas
