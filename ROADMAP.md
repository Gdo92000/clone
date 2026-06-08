# ROADMAP — Gap Closure

## Fase 1: Correção da Documentação README
**Objetivo:** Adicionar as 4 rotas backend faltantes ao README.md

| Tarefa | Descrição |
|--------|-----------|
| 1.1 | Adicionar `consumer-support` à lista de rotas |
| 1.2 | Adicionar `subscription-addons` à lista de rotas |
| 1.3 | Adicionar `user-notifications` à lista de rotas |
| 1.4 | Adicionar `theme` à lista de rotas |
| 1.5 | Atualizar contagem de endpoints (37) |

**Critério de conclusão:** README.md lista todas as 37 rotas backend

---

## Fase 2: Implementação do Módulo Enterprise (UI)
**Objetivo:** Criar páginas e rotas para o módulo Enterprise

| Tarefa | Descrição |
|--------|-----------|
| 2.1 | Analisar hooks existentes (usePlanLimits, useAuditLog, enterpriseData) |
| 2.2 | Criar EnterpriseDashboardPage — visão geral multi-unidade |
| 2.3 | Criar EnterpriseBranchesPage — gestão de filiais corporativas |
| 2.4 | Criar EnterprisePlansPage — limites e uso do plano |
| 2.5 | Criar EnterpriseAuditPage — log de auditoria corporativo |
| 2.6 | Registrar rotas no App.tsx e routes.ts |
| 2.7 | Atualizar CURRENT_STATE.md |

**Critério de conclusão:** 4 páginas enterprise funcionais + rotas registradas

---

## Fase 3: Roteirização Courier
**Objetivo:** Adicionar tela de roteirização/planejamento de rotas para entregadores

| Tarefa | Descrição |
|--------|-----------|
| 3.1 | Criar CourierRoutePage — planejamento de rota |
| 3.2 | Integrar com TrackingPage existente |
| 3.3 | Registrar rota no App.tsx |

**Critério de conclusão:** Entregador consegue visualizar e planejar sua rota de entregas

---

## Fase 4: Correção de Linter
**Objetivo:** Reduzir erros de linter nos ~94 arquivos remanescentes

| Tarefa | Descrição |
|--------|-----------|
| 4.1 | Corrigir tipagem drizzle em base-postgres.ts |
| 4.2 | Corrigir unnecessary-condition em loader.ts, registry-shots.ts, base-memory.ts |
| 4.3 | Remover/renomear variáveis não usadas |
| 4.4 | Rodar `npm run lint` e verificar zero erros |

**Critério de conclusão:** `npm run lint` sem erros

---

## Fase 5: Correção da Camada de Abstração DEV/PROD
**Objetivo:** Garantir paridade arquitetural entre DEV (memory) e PROD (postgres) nos dois lados (frontend + server), eliminar dead code, implementar CRUD real onde faltante

| Tarefa | Descrição |
|--------|-----------|
| 5.1 | **ServiceProvider switch** — Adicionar prop `provider` em ServiceProvider, App.tsx passa `DEV ? 'memory' : 'postgres'`, wire composition-postgres |
| 5.2 | **resolveDbProvider fix** — Server: consumir `DATABASE_PROVIDER` env var em vez do hack `DATABASE_URL='memory'` |
| 5.3 | **Server routes + health fix** — Proxy `db` em memory mode nao retorna undefined; health check usa `registry.health.check()` |
| 5.4 | **Remover dead code** — MemoryAdminRepository, MemorySuperadminRepository, PostgresAdminRepository, PostgresSuperadminRepository (nao wired em nenhum fluxo) |
| 5.5 | **CRUD real em Operations** — Implementar findMany/findById/create/update/remove/count/exists com dados reais em Memory + Postgres |
| 5.6 | **CRUD real em Enterprise** — Implementar findMany/findById/create/update/remove/count/exists com dados reais em Memory + Postgres |
| 5.7 | **Soft delete** — Adicionar `restore()` ao RepositoryPort, alterar `remove()` para soft delete com `deletedAt`, propagar para todas as implementacoes |

**Critério de conclusão:** Lint 0 erros, Build OK, auth suite 20/20 verde, E2E 54/54 verde, server testa memory + postgres modos
