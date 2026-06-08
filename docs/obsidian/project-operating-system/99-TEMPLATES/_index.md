---
type: index
status: template
domain: templates
layer: template
semantic_priority: 5
tags:
  - type/index
  - domain/templates
  - type/template
created_at: 2026-05-26
updated_at: 2026-05-26
---

# 99-TEMPLATES — Templates Reutilizáveis

Organização anti-obsolescência: templates separados em source (cold storage), reusable (cópia limpa) e generated (instâncias automáticas).

## Estrutura

| Diretório | Propósito | Retrieval |
|-----------|-----------|-----------|
| [[source/_index\|source/]] | Fonte geradora imutável (cold storage) | ❌ Baixo |
| [[reusable/_index\|reusable/]] | Templates reutilizáveis limpos | 🔹 Template only |
| [[generated/_index\|generated/]] | Instâncias geradas automaticamente | 🔹 Baixo |



## Instâncias operacionais ativas

Estes arquivos nos diretórios de domínio são as **instâncias operacionais reais** — preenchidas com dados do projeto e com alta prioridade semântica:

| Documento | Localização | Prioridade |
|-----------|-------------|------------|
| `SYSTEM_CONTRACT` | `00-SYSTEM/SYSTEM_CONTRACT.md` | ⭐ 5 |
| `FEATURE_SPEC` | `01-PRODUCT/FEATURE_SPEC.md` | ⭐ 4 |
| `ARCHITECTURE_RULES` | `02-ARCHITECTURE/ARCHITECTURE_RULES.md` | ⭐ 5 |
| `DECISION_LOG` | `02-ARCHITECTURE/DECISION_LOG.md` | ⭐ 5 |
| `CODE_STANDARDS` | `03-ENGINEERING/CODE_STANDARDS.md` | ⭐ 4 |
| `FOLDER_STRUCTURE` | `03-ENGINEERING/FOLDER_STRUCTURE.md` | ⭐ 4 |
| `BUG_REPORT_TEMPLATE` | `03-ENGINEERING/BUG_REPORT_TEMPLATE.md` | ⭐ 3 |
| `REFATOR_PLAN` | `03-ENGINEERING/REFATOR_PLAN.md` | ⭐ 4 |
| `AGENT_PROTOCOL` | `04-AGENTS/AGENT_PROTOCOL.md` | ⭐ 5 |
| `TEST_PLAN` | `09-TESTING/TEST_PLAN.md` | ⭐ 3 |
| `PROJECT_BOOTSTRAP` | `99-TEMPLATES/PROJECT_BOOTSTRAP.md` | ⭐ 5 |

## Como usar

1. Para **novo projeto**: copie `reusable/*.template.md` para os destinos
2. Para **instância existente**: edite diretamente nos diretórios de domínio
3. **Source** não deve ser editado para mudanças de projeto

## Relações

- [[_index|POS Index]]
- [[00-SYSTEM/_index\|00-SYSTEM]] — Regras que os templates implementam
- [[04-AGENTS/_index\|04-AGENTS]] — Templates para agentes
