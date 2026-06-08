---
type: taxonomy
status: active
domain: system
layer: L0
immutable: true
zone: IMMUTABLE
criticality: HIGH
semantic_priority: 5
tags:
  - meta/layer
  - governance
created_at: 2026-05-28
updated_at: 2026-05-28
---

# Layer Taxonomy

Definição formal da estrutura de camadas do POS (Project Operating System). Todos os diretórios de domínio devem seguir esta taxonomia.

## Numbered Layers (00-09)

Sequência numérica contínua representando domínios funcionais. Cada camada possui:

- `_index.md` — MOC (Map-Of-Content) que lista conteúdos e relações.
- Documentos concretos que implementam regras/templates para aquele domínio.

| Camada | Domínio | Status | Notas |
|--------|---------|--------|-------|
| `00-SYSTEM` | Runtime core, contracts, budget, event stream | ✅ Ativo | L1 |
| `01-PRODUCT` | Product vision, roadmap, feature specs | ✅ Template | L2 |
| `02-ARCHITECTURE` | ADRs, C4 model, API contracts, decisions | ✅ Draft | L2 |
| `03-ENGINEERING` | Code standards, folder structure, bug reports | ✅ Template | L2 |
| `04-AGENTS` | Agent protocol, skill registry, capability discovery | ✅ Draft | L2 |
| `05-DATA` | Data models, schemas, migrations, storage strategy | ✅ MOC only | L2 |
| `06-UI-UX` | User experience, design systems, UI components | ❌ Faltando | L2 |
| `07-INFRASTRUCTURE` | Deployment, infrastructure, CI/CD, monitoring | ❌ Faltando | L2 |
| `08-SECURITY` | Security runtime, threat model, compliance | ✅ Ativo | L2 |
| `09-TESTING` | Test plans, strategies, coverage | ✅ Template | L2 |
| `99-TEMPLATES` | Source (cold), reusable (clean), generated (instances) | ✅ Ativo | Template layer |

## Logical Layers (L1/L2/L3)

Complementar à numeração, classifica prioridade e retenção de contexto:

- **L1 (Kernel)** — Contratos imutáveis, regras de execução, bootstrap. Alta prioridade semântica (`semantic_priority: 5`). Inclui: `AGENTS.md` (root), `00-SYSTEM/*`, possivelmente `SYSTEM_CONTRACT.md`. Essenciais para inicialização.
- **L2 (Domains/MOCs)** — Índices de domínio que organizam o conhecimento. Prioridade média (`semantic_priority: 3-4`). Inclui todos os `_index.md` das camadas 01-09. Guiam a navegação e retrieval.
- **L3 (Guides/Templates)** — Documentação detalhada, templates, planos. Prioridade variável (`semantic_priority: 2-5`). Incluem arquivos como `CODE_STANDARDS.md`, `AGENT_PROTOCOL.md`, arquivos em `99-TEMPLATES/reusable/`.

## Retrieval Strategy by Layer

| Layer Type | Access Pattern | Cache Duration | Notes |
|------------|----------------|----------------|-------|
| L1 Kernel | Hot, frequent | Permanent | Never evicted |
| L2 MOCs | Hot, on-demand | Session | Loaded once per session |
| L3 Guides | Warm/cold | Background | May be lazy-loaded |
| 99-TEMPLATES (source) | Cold | Never | Skip retrieval unless explicitly requested |
| Generated templates | Cold/warm | As needed | Varies by file |

## Naming Conventions

- Diretórios de domínio usam números de 2 dígitos com hífen: `00-SYSTEM`, `01-PRODUCT`, etc.
- MOCs sempre chamados `_index.md`.
- Arquivos frontmatter devem conter `layer: L1|L2|L3` e `semantic_priority: 1-5`.
- Tags devem incluir `type/index` para MOCs e `type/template` para arquivos de template.

## Completeness Rules

- Cada domínio numerado de 00-09 **deve** ter um `_index.md` válido, mesmo que vazio (placeholders permitidos).
- Referências a domínios inexistentes (ex: `06-UI-UX/` em `01-PRODUCT/_index.md`) devem ser resolvidas criando o diretório com `_index.md` mínimo ou removendo a referência.
- Números de camada não podem ser pulados indevidamente. Gaps devem ser documentados.

## Change Policy

- Modificações em L1 requerem validação de contrato (SYSTEM_CONTRACT).
- Adição de novos domínios (novos números) requer atualização deste LAYER_TAXONOMY e redistribuição de responsabilidades.
- Reordenação de camadas é de alto risco e requer migração de todos os referenciadores.
