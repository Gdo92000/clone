---
type: template
status: template
domain: system
layer: template
semantic_priority: 5
tags:
  - type/template
  - domain/system
  - tech/bootstrap
aliases:
  - Project Bootstrap
created_at: 2026-05-26
updated_at: 2026-05-27
---

# PROJECT_BOOTSTRAP

## PROJECT IDENTIFICATION

PROJECT_NAME=
PROJECT_TYPE=
DOMAIN=
PRIMARY_LANGUAGE=
TARGET_PLATFORM=
DEPLOY_TARGET=

---

## OBJECTIVE

Describe the core objective of the system.

- Problem solved:
- Target users:
- Primary business value:
- Constraints:

---

## PROFILING

Definir perfil de carregamento no `.opencode/profile.json`:

| Perfil | Quando usar |
|--------|-------------|
| `express` | Projeto novo, template limpo, sem baggage |
| `full` | Projeto maduro com memória consolidada |
| `audit` | Debugging, revisão de segurança/arquitetura |
| `complete` | Máxima capacidade, todos os domínios |

Padrão para novos projetos: `express`. Mude para `full` após setup inicial.

---

## SYSTEM PRIORITIES

Priority order:

1. Reliability
2. Security
3. Performance
4. Maintainability
5. Scalability
6. Developer Experience

---

## APPROVED STACK

### Frontend
- Framework:
- State management:
- UI library:
- Routing:
- Forms:
- Validation:

### Backend
- Runtime:
- Framework:
- ORM:
- Authentication:
- API pattern:

### Database
- Engine:
- Migration strategy:
- Isolation level:

### Infrastructure
- Hosting:
- CI/CD:
- Monitoring:
- Logging:

---

## DELIVERY RULES

- Production-ready code only
- No hidden technical debt
- No placeholder implementation
- No partial architecture
- All layers isolated
- Tests required
- Lint required
- Type safety required

---

## ACCEPTANCE CRITERIA

The bootstrap phase is complete only if:

- Folder structure exists
- Environment configured
- Perfil definido em `.opencode/profile.json`
- CI running
- Lint running
- Tests running
- Architecture documented
- Contracts defined
- Base modules initialized

## Relações

- [[_index|99-TEMPLATES]]
- [[CURRENT_STATE]] — Estado após bootstrap
- [[00-SYSTEM/SYSTEM_CONTRACT|System Contract]] — Contrato a ser preenchido
- `.opencode/profile.json` — Perfil de carregamento
