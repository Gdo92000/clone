---
type: index
status: template
domain: templates
layer: template
semantic_priority: 2
embedding_priority: low
rag_visibility: template
tags:
  - type/index
  - domain/templates
  - type/template
created_at: 2026-05-26
updated_at: 2026-05-26
---

# reusable/ — Templates Reutilizáveis

Templates limpos e reutilizáveis. Cópia para destino operacional antes de preencher. Baixa prioridade semântica — não competem com memória operacional ativa.

## Templates

| Template | Destino Operacional |
|----------|---------------------|
| [[SYSTEM_CONTRACT.template\|SYSTEM_CONTRACT]] | `00-SYSTEM/SYSTEM_CONTRACT.md` |
| [[ARCHITECTURE_RULES.template\|ARCHITECTURE_RULES]] | `02-ARCHITECTURE/ARCHITECTURE_RULES.md` |
| [[AGENT_PROTOCOL.template\|AGENT_PROTOCOL]] | `04-AGENTS/AGENT_PROTOCOL.md` |
| [[CODE_STANDARDS.template\|CODE_STANDARDS]] | `03-ENGINEERING/CODE_STANDARDS.md` |
| [[FOLDER_STRUCTURE.template\|FOLDER_STRUCTURE]] | `03-ENGINEERING/FOLDER_STRUCTURE.md` |
| [[FEATURE_SPEC.template\|FEATURE_SPEC]] | `01-PRODUCT/FEATURE_SPEC.md` |
| [[DECISION_LOG.template\|DECISION_LOG]] | `02-ARCHITECTURE/DECISION_LOG.md` |
| [[BUG_REPORT.template\|BUG_REPORT]] | `03-ENGINEERING/BUG_REPORT_TEMPLATE.md` |
| [[REFATOR_PLAN.template\|REFATOR_PLAN]] | `03-ENGINEERING/REFATOR_PLAN.md` |
| [[TEST_PLAN.template\|TEST_PLAN]] | `09-TESTING/TEST_PLAN.md` |
| [[PROJECT_BOOTSTRAP.template\|PROJECT_BOOTSTRAP]] | `99-TEMPLATES/PROJECT_BOOTSTRAP.md` |

## Uso

1. Copie o `.template.md` desejado para o destino
2. Remova o sufixo `.template`
3. Preencha as seções com dados do projeto
4. Atualize o `_index.md` do diretório alvo

## Regras

- semantic_priority: 2 (não competir com operacional)
- embedding_priority: low
- rag_visibility: template
- Never edit templates directly in `reusable/` for project-specific changes

## Relações

- [[../_index|99-TEMPLATES Index]]
- [[../source/_index|source/]] — Fonte geradora
- [[../generated/_index|generated/]] — Instâncias geradas
