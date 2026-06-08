---
type: guide
status: draft
domain: agents
layer: L1
semantic_priority: 5
tags:
  - type/guide
  - domain/agents
  - tech/skills
aliases:
  - Skill Registry
  - Catálogo de Skills
created_at: 2026-05-26
updated_at: 2026-05-27
profile_filter: full|audit|complete
---

# SKILL REGISTRY

Catálogo central de skills do POS. Skills são carregadas sob demanda — nenhuma skill é pré-carregada no bootstrap. O agente ativa a skill automaticamente quando detecta o domínio correspondente.

---

## Active Skills (recommended, auto-load on domain match)

| Skill | Perfil | Gatilho |
|-------|--------|---------|
| `react-best-practices` | express+ | Código React/Next.js |
| `api-patterns` | express+ | API design, endpoints |
| `tailwind-patterns` | express+ | CSS, estilos |
| `nodejs-best-practices` | express+ | Código Node.js |
| `testing-patterns` | express+ | Testes |

## Available Skills (on-demand)

| Skill | Perfil | Gatilho |
|-------|--------|---------|
| `system-bootstrap` | express+ | Bootstrap |
| `crash-recovery` | express+ | Recovery detectado |
| `obsidian-vault-manager` | full+ | Criar/mover notas |
| `obsidian-wikilink-manager` | full+ | Alteração de caminho |
| `semantic-indexer` | full+ | Nova nota |
| `session-recovery` | full+ | Início de sessão |
| `architecture-auditor` | audit+ | SYSTEM_CONTRACT check |
| `adr-manager` | full+ | Decisão L1-L6 |
| `code-reviewer` | complete | Pull request |
| `lint-validator` | complete | Antes de commit |
| `typecheck-validator` | complete | Antes de build |
| `build-validator` | complete | Antes de deploy |

Skills não listadas em `.opencode/skills/` são carregadas sob demanda quando o domínio correspondente é ativado.

---

## Core Skills (loaded on all profiles)

### system-bootstrap
| Campo | Valor |
|-------|-------|
| Objetivo | Inicializar POS em novo projeto |
| Gatilhos | `PROJECT_BOOTSTRAP` |
| Prioridade | 5 |
| Semantic impact | Alto |
| Retrieval cost | Baixo |

### crash-recovery
| Campo | Valor |
|-------|-------|
| Objetivo | Recuperar sessão interrompida |
| Gatilhos | CURRENT_STATE, LAST_CHECKPOINT |
| Prioridade | 5 |
| Semantic impact | Alto |

---

## Obsidian Skills (profile: full+)

### obsidian-vault-manager
| Campo | Valor |
|-------|-------|
| Gatilhos | Criar/mover/remover notas |
| Prioridade | 4 |
| Restrições | Nunca deletar, sempre arquivar |

### obsidian-wikilink-manager
| Campo | Valor |
|-------|-------|
| Gatilhos | Alteração de caminho de nota |
| Prioridade | 4 |
| Retrieval cost | Baixo |

---

## Semantic Skills (profile: full+)

### semantic-indexer
| Campo | Valor |
|-------|-------|
| Gatilhos | Nova nota criada, tag alterada |
| Prioridade | 4 |
| Retrieval cost | Alto |

### rag-optimizer
| Campo | Valor |
|-------|-------|
| Gatilhos | Retrieval performance degradada |
| Prioridade | 3 |
| Retrieval cost | Máximo |

---

## Recovery Skills (profile: express+)

### session-recovery
| Campo | Valor |
|-------|-------|
| Gatilhos | Início de sessão, crash detectado |
| Prioridade | 5 |
| Retrieval cost | Alto |

### checkpoint-manager
| Campo | Valor |
|-------|-------|
| Gatilhos | Task >30min, múltiplas fases |
| Prioridade | 4 |

### rollback-manager
| Campo | Valor |
|-------|-------|
| Gatilhos | Mudança destrutiva |
| Prioridade | 4 |

---

## Architecture Skills (profile: audit+)

### architecture-auditor
| Campo | Valor |
|-------|-------|
| Gatilhos | SYSTEM_CONTRACT, ARCHITECTURE_RULES |
| Prioridade | 4 |
| Retrieval cost | Médio |

### adr-manager
| Campo | Valor |
|-------|-------|
| Gatilhos | Decisão L1-L6 |
| Prioridade | 4 |

---

## Validation Skills (profile: complete)

### lint-validator
| Campo | Valor |
|-------|-------|
| Prioridade | 4 |
| Retrieval cost | Baixo |

### typecheck-validator
| Campo | Valor |
|-------|-------|
| Prioridade | 4 |
| Retrieval cost | Baixo |

### build-validator
| Campo | Valor |
|-------|-------|
| Prioridade | 5 |
| Retrieval cost | Baixo |

---

## Engineering Skills (profile: complete)

### code-reviewer
| Campo | Valor |
|-------|-------|
| Gatilhos | Pull request, fase concluída |
| Prioridade | 4 |

### dependency-auditor
| Campo | Valor |
|-------|-------|
| Gatilhos | package.json alterado |
| Prioridade | 3 |

---

## Efficiency Skills (profile: full+)

### semantic-deduplicator
| Campo | Valor |
|-------|-------|
| Gatilhos | Retrieval duplication > 5% |
| Prioridade | 4 |
| Retrieval cost | Alto |

### snapshot-manager
| Campo | Valor |
|-------|-------|
| Gatilhos | Event threshold, budget exceeded |
| Prioridade | 4 |

### coordination-manager
| Campo | Valor |
|-------|-------|
| Gatilhos | AGENT_COORDINATION state change |
| Prioridade | 5 |

### telemetry-manager
| Campo | Valor |
|-------|-------|
| Gatilhos | Retrieval event, health check |
| Prioridade | 3 |

---

## Relações

- [[_index|04-AGENTS Index]]
- [[CAPABILITY_DISCOVERY]] — Descoberta de capacidades
- [[AGENT_PROTOCOL]] — Protocolo de execução
- `.opencode/profile.json` — Perfil ativo
