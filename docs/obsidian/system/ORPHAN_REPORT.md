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
  - GRAPH_HEALTH
  - AUTO_LINKING
  - KNOWLEDGE_DECAY
---

# Orphan Report

Detecção e tratamento de notas órfãs — notas sem backlinks de entrada, desconectadas do grafo semântico.

> [!danger] Objetivo
> Zero orphan notes. Toda nota deve ter pelo menos 1 backlink de entrada de MOC, authority note ou System Index.

## Critérios de detecção

| Tipo | Definição | Severidade |
|------|-----------|------------|
| Orphan total | 0 backlinks de entrada | Crítica |
| Weak note | 1 backlink apenas | Alta |
| Disconnected | Sem link para MOC ou hub central | Alta |
| Cluster orphan | Nota ligada apenas a outras órfãs | Média |

## Workflow de reparo

```
orphan detected → classify → find domain → link to MOC → verify
```

| Etapa | Ação | Responsável |
|-------|------|-------------|
| 1 | Identificar domínio da nota | Analisar conteúdo e frontmatter |
| 2 | Encontrar MOC correspondente | Consultar [[SEMANTIC_INDEX]] |
| 3 | Adicionar wikilink no MOC | Editar MOC adicionando entrada na tabela |
| 4 | Adicionar wikilink de volta na nota | Linkar da nota para o MOC |
| 5 | Verificar conectividade | Recalcular via [[GRAPH_HEALTH]] |

## Reconnect suggestions

| Cenário | Solução |
|---------|---------|
| Nota de componente sem MOC | Adicionar link em [[MOC Frontend]] |
| Worklog de merchant sem MOC | Adicionar link em [[MOC Merchant]] |
| Nota de teste sem MOC | Adicionar link em [[MOC Testing]] |
| ADR sem MOC | Adicionar link em [[MOC Architecture]] |
| Nota de auth sem MOC | Adicionar link em [[MOC Auth]] |
| Nota genérica (domínio indefinido) | Arquivar em `archive/` |

## Graph repair workflow

```
1. Escanear orphan notes
2. Classificar por domínio usando frontmatter `domain:`
3. Para cada orphan:
   a. Identificar MOC do mesmo domínio
   b. Adicionar wikilink no MOC
   c. Adicionar wikilink de volta se relevante
4. Re-escanear grafo
5. Verificar resultado via [[GRAPH_HEALTH]]
```

## Prevenção

- Toda nota nova deve ser registrada em um MOC ([[MOC Obsidian System#Workflow de criação de notas]])
- Toda nota deve ter `domain:` no frontmatter para classificação automática
- Usar [[AUTO_LINKING]] heuristics para detectar links faltantes

## Related system notes

- [[GRAPH_HEALTH]] — Métricas de conectividade
- [[AUTO_LINKING]] — Heurísticas de linking automático
- [[KNOWLEDGE_DECAY]] — Decay para notas órfãs não reconectadas
