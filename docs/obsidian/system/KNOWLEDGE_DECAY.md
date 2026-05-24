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
  - MEMORY_LIFECYCLE
  - SEMANTIC_SCORING
  - ORPHAN_REPORT
---

# Knowledge Decay

Política de envelhecimento e obsolescência de conhecimento no vault. Define quando uma nota deve ser revisada, arquivada ou removida do retrieval ativo.

> [!warning] Decay não é deleção
> Nenhuma nota é deletada automaticamente. Notas com decay alto são movidas para `archive/` conforme [[MEMORY_LIFECYCLE]].

## Decay scoring

```
decay_score = (days_since_update / 365 × 0.5) + (stale_factor × 0.3) + (orphan_penalty × 0.2)
```

| Fator | Peso | Descrição |
|-------|------|-----------|
| days_since_update | 50% | Dias desde a última atualização |
| stale_factor | 30% | Nota referencia tecnologia/API que mudou |
| orphan_penalty | 20% | Nota perdeu backlinks desde a criação |

## Decay thresholds

| Score | Status | Ação |
|-------|--------|------|
| 0.0 — 0.3 | Fresh | Retrieval ativo, sem ação |
| 0.3 — 0.5 | Aging | Agendar revisão nos próximos 30 dias |
| 0.5 — 0.7 | Stale | Revisão obrigatória; reduzir prioridade no retrieval |
| 0.7 — 0.9 | Decayed | Excluir do retrieval ativo; considerar archive |
| 0.9 — 1.0 | Archived | Mover para `archive/` |

## Aging policy por tipo

| Tipo de nota | Review interval | Decay acceleration |
|-------------|----------------|-------------------|
| MOC | 12 meses | Baixa (conhecimento estrutural) |
| Knowledge note | 6 meses | Média (depende da tecnologia) |
| ADR | 24 meses | Baixa (decisão permanente) |
| Worklog | 3 meses | Alta (nota temporária) |
| Component note | 6 meses | Média (segue versão do componente) |
| System note | 12 meses | Baixa (infraestrutura) |
| CURRENT_STATE | Por sessão | Máxima (substituído a cada sessão) |

## Stale knowledge detection

| Indicador | Exemplo | Ação |
|-----------|---------|------|
| Versão desatualizada | "React 18" → React 19 | Atualizar versão |
| API deprecada | Rota removida | Remover ou marcar como obsoleta |
| Link quebrado | MOC renomeado | Corrigir wikilink |
| Decisão revertida | ADR superseded | Adicionar link para ADR substituto |

## Archive triggers

Archive é acionado quando:

1. Decay score > 0.7 por 2 ciclos de revisão consecutivos
2. Nota órfã (0 backlinks) por > 6 meses
3. Nota superseded por ADR ou knowledge note mais recente
4. Tecnologia/feature removida do projeto

## Review intervals

| Intervalo | Tipo | Metodologia |
|-----------|------|-------------|
| Por sessão | CURRENT_STATE | Consolidar e limpar |
| Semanal | Worklogs recentes | Revisar, arquivar ou promover |
| Mensal | Novas knowledge notes | Validar contra código atual |
| Trimestral | Todas as knowledge notes | Auditoria completa |
| Semestral | MOCs | Atualizar catálogo e links |
| Anual | ADRs | Verificar relevância |

## Related system notes

- [[MEMORY_LIFECYCLE]] — Ciclo de vida da memória
- [[SEMANTIC_SCORING]] — Decay score integrado ao ranking
- [[ORPHAN_REPORT]] — Orphan detection para notas em decay
