---
type: index
status: active
domain: agents
layer: L1
semantic_priority: 5
tags:
  - type/index
  - domain/agents
  - tech/routing
aliases:
  - Agent Registry
  - Agent Routing Table
created_at: 2026-05-27
updated_at: 2026-05-27
profile_filter: complete
pos_version: 1.0.0
---

# Agent Registry — Roteador de Agentes

Catálogo central de agentes especialistas. O perfil ativo (`.opencode/profile.json`) determina quais agentes estão visíveis para roteamento.

O `orchestrator` consulta este registry para determinar quais agentes podem ser invocados. Agentes fora do perfil ativo não são sugeridos.

---

## Profile Loading Matrix

| Perfil | Agentes Visíveis | Total |
|--------|-----------------|:-----:|
| `express` | orchestrator, project-planner, explorer-agent, debugger | 4 |
| `full` | + frontend-specialist, backend-specialist, database-architect, test-engineer, code-archaeologist, documentation-writer, devops-engineer | 11 |
| `audit` | + security-auditor, penetration-tester, qa-automation-engineer | 14 |
| `complete` | + game-developer, mobile-developer, performance-optimizer, seo-specialist, product-manager, product-owner | 20 |

---

## Agente Cross-cutting

| Agente | Perfis | Motivo |
|--------|--------|--------|
| `debugger` | express, full, audit | Debugging é universal. Bugs podem aparecer em qualquer perfil/maturidade. |

---

## Tabela de Agentes

### Core Agents (express+)

| Agente | Domínio | Skills Associadas |
|--------|---------|-------------------|
| [[orchestrator\|orchestrator]] | Coordenação multi-agente | parallel-agents, behavioral-modes, plan-writing, brainstorming, architecture, coordinator-mode, memory-system, context-compression, verify-changes |
| [[project-planner\|project-planner]] | Planejamento de projetos | app-builder, plan-writing, brainstorming |
| [[explorer-agent\|explorer-agent]] | Descoberta/análise de codebase | architecture, plan-writing, brainstorming, systematic-debugging |
| [[debugger\|debugger]] | Debugging universal | systematic-debugging |

### Full Stack Agents (full+)

| Agente | Domínio | Skills Associadas |
|--------|---------|-------------------|
| [[frontend-specialist\|frontend-specialist]] | Frontend (React/Next.js) | nextjs-react-expert, web-design-guidelines, tailwind-patterns, frontend-design |
| [[backend-specialist\|backend-specialist]] | Backend (Node.js/Python) | nodejs-best-practices, python-patterns, api-patterns, database-design, mcp-builder |
| [[database-architect\|database-architect]] | Schema/otimização de DB | database-design |
| [[test-engineer\|test-engineer]] | Testes unitários/integração | testing-patterns, tdd-workflow, webapp-testing, code-review-checklist |
| [[code-archaeologist\|code-archaeologist]] | Refatoração/legado | code-review-checklist |
| [[documentation-writer\|documentation-writer]] | Documentação técnica | documentation-templates |
| [[devops-engineer\|devops-engineer]] | Deploy/CI-CD/infra | deployment-procedures, server-management |

### Security Agents (audit+)

| Agente | Domínio | Skills Associadas |
|--------|---------|-------------------|
| [[security-auditor\|security-auditor]] | Auditoria de segurança | vulnerability-scanner, red-team-tactics, api-patterns |
| [[penetration-tester\|penetration-tester]] | Teste de penetração | vulnerability-scanner, red-team-tactics, api-patterns |
| [[qa-automation-engineer\|qa-automation-engineer]] | Automação E2E/regressão | webapp-testing, testing-patterns, web-design-guidelines |

### Specialized Agents (complete+)

| Agente | Domínio | Skills Associadas |
|--------|---------|-------------------|
| [[game-developer\|game-developer]] | Desenvolvimento de jogos | game-development (10 sub-skills) |
| [[mobile-developer\|mobile-developer]] | Mobile (React Native/Flutter) | mobile-design |
| [[performance-optimizer\|performance-optimizer]] | Otimização de performance | performance-profiling |
| [[seo-specialist\|seo-specialist]] | SEO/GEO | seo-fundamentals, geo-fundamentals |
| [[product-manager\|product-manager]] | Requisitos/elicitação | plan-writing, brainstorming |
| [[product-owner\|product-owner]] | Gestão de produto/roadmap | plan-writing, brainstorming |

---

## Regras de Roteamento

1. **Orquestrador** consulta este registry ANTES de sugerir um agente especialista.
2. Agentes fora do perfil ativo são **invisíveis** para roteamento automático.
3. Invocação explícita por nome sempre funciona (independente do perfil).
4. `debugger` está disponível em express, full e audit (cross-cutting).
5. `product-manager` e `product-owner` têm gate adicional: só são ativados em tarefas de "Discovery/Elicitação de Requisitos", mesmo no perfil complete.
6. Skills associadas só são carregadas quando o agente é ativado (não no bootstrap).

---

## Relações

- `.opencode/profile.json` — Perfil ativo do projeto
- [[docs/obsidian/project-operating-system/04-AGENTS/SKILL_REGISTRY\|POS SKILL_REGISTRY]] — Skills carregadas por perfil
- [[docs/obsidian/project-operating-system/_index\|POS Index]] — Roteador do POS
