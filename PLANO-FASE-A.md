# Plano Fase A — Bloqueadores Obrigatórios para Produção

## Evidência Confirmada: Vazamento Multi-tenant

**Reprodução:** Como merchant autenticado, `GET /api/companies` retorna array com TODAS as empresas (tabela `companies` sem filtro). Mesmo padrão em `GET /api/branches` (tabela `branches` sem filtro). Nenhum middleware de tenant aplicado. `requireTenantOwnership` só bloqueia rotas com param `:id` — rotas GET sem param são bypassadas.

## Entidades Sujeitas a Limites de Plano

Schema `plans.ts` define: `max_branches`, `max_products`, `max_users`, `max_campaigns`

| Entidade | Limite | Rota de Criação | Status |
|----------|--------|-----------------|--------|
| Branches | `max_branches` | `POST /branches` (`branches.ts:222`) | ❌ Sem validação |
| Menu Items | `max_products` | `POST /branches/:id/menu-items` (`branches.ts:73`) | ❌ Sem validação |
| Users | `max_users` | `admin-users.ts` (superadmin apenas) | ⚠️ Já restrito |
| Campaigns | `max_campaigns` | `POST /campaigns` (`campaigns.ts:67`) | ❌ Sem validação |

---

## Tarefa 1: Filtro Multi-tenant em GET /companies e GET /branches

### 1.1 GET /companies — `server/src/routes/companies.ts`
- [ ] **Linha 12-15:** Substituir `db.select().from(companies)` por query filtrada por `company_id` do usuário autenticado
- [ ] Usar middleware existente: adicionar `requireTenantOwnership('companyId')` na rota `GET /`
- [ ] **Verificação:** `GET /api/companies` como merchant retorna apenas a própria empresa

### 1.2 GET /branches — `server/src/routes/branches.ts`
- [ ] **Linha 53-56:** Substituir `db.select().from(branches)` por query com `eq(branches.company_id, userCompanyId)`
- [ ] Aproveitar middlewares existentes: rota já usa `requirePermission`, adicionar `requireTenantOwnership` ou `tenantIsolationMiddleware`
- [ ] **Verificação:** `GET /api/branches` como merchant retorna apenas filiais da própria empresa

---

## Tarefa 2: Enforce Limites de Plano no Backend

### 2.1 Criar middleware `requirePlanLimit` — `server/src/middleware/planLimits.ts` (novo)
- [ ] Função recebe `resourceType: 'branches' | 'products' | 'campaigns'`
- [ ] Busca subscription + plan ativo do `company_id` do usuário
- [ ] Conta registros existentes (`branches`, `menuItems`, `campaigns`)
- [ ] Compara com `max_*` do plano
- [ ] Se excedido: retorna `409 Conflict` com payload `{ error, limit, current, plan_id }`
- [ ] Superadmin bypass

### 2.2 Aplicar em `branches.ts` — POST /
- [ ] **Linha 222-248:** Adicionar `requirePlanLimit('branches')` antes de `POST /`
- [ ] **Verificação:** `POST /branches` com limites_excedidos retorna 409

### 2.3 Aplicar em `branches.ts` — POST /:id/menu-items
- [ ] **Linha 73-99:** Adicionar `requirePlanLimit('products')` antes de `POST /:id/menu-items`
- [ ] **Verificação:** `POST /branches/xyz/menu-items` com `max_products` excedido retorna 409

### 2.4 Aplicar em `campaigns.ts` — POST /
- [ ] **Linha 67-98:** Adicionar `requirePlanLimit('campaigns')` antes de `POST /`
- [ ] **Verificação:** `POST /campaigns` com `max_campaigns` excedido retorna 409

---

## Tarefa 3: Parametrizar Taxas Financeiras

### 3.1 Adicionar campos no schema `plans` — `server/src/db/schema/saas/plans.ts`
- [ ] Adicionar `platform_fee_rate: numeric('platform_fee_rate', { precision: 5, scale: 4 }).default('0.12')` (ex: 0.12 = 12%)
- [ ] Adicionar `delivery_fee_per_order: numeric('delivery_fee_per_order', { precision: 10, scale: 2 }).default('5.00')`
- [ ] **Verificação:** `npm run db:generate` gera migration; campos existem no schema

### 3.2 Atualizar seed de planos
- [ ] Incluir `platform_fee_rate` e `delivery_fee_per_order` nos seeds existentes (`basic`, `pro`, `premium`)
- [ ] **Verificação:** `npm run db:seed` (ou equivalente) popula com valores corretos

### 3.3 Atualizar `merchant-finance.ts` — buscar taxas do plano
- [ ] **Linhas 31-33 (hardcoded):** Substituir `0.12` e `5` por JOIN com `subscriptions` + `plans`
- [ ] Query: `SELECT p.platform_fee_rate, p.delivery_fee_per_order FROM plans p JOIN subscriptions s ON s.plan_id = p.id WHERE s.company_id = ?`
- [ ] Fallback para valores padrão se plano não encontrado (0.12, 5.00)
- [ ] **Verificação:** endpoint retorna valores corretos para planos diferentes

---

## Validação Obrigatória (após cada tarefa)

- [ ] `npm run lint` — 0 erros
- [ ] `npx tsc -b` — 0 erros
- [ ] `npm run test:run` — todos testes passam
- [ ] Verificação manual da correção aplicada (curl/insomnia)

---

## Ordem de Execução Fase A

1. **Tarefa 1** (1h) — Filtro multi-tenant
2. **Tarefa 2** (4h) — Enforce limites (paralelo possível: 2.1 em separado de 2.2-2.4)
3. **Tarefa 3** (2h) — Taxas parametrizadas (pode ser paralela com Tarefa 2)

**Total estimado: 7h**
