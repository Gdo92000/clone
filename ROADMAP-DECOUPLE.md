# ROADMAP — Decoupling UI from Mock Data

## Diagnóstico

| Acoplamento | Local | Risco |
|---|---|---|
| `enterpriseData.ts` importado por 3 páginas | `src/modules/enterprise/` | 🔴 Alto |
| `usePlanLimits` com valores hardcoded | `enterprise/usePlanLimits.ts:24-28` | 🔴 Alto |
| `MockRestaurantProvider` importa fixtures | `src/providers/restaurant/` | 🟡 Médio |
| MSW handlers com dados inline | `handlers/printing.ts`, `handlers/proxy.ts` | 🟡 Médio |
| Dados inline em páginas (expenses, areas, roles) | Várias páginas | 🟢 Baixo |

## Arquitetura Alvo

```
Page
  → Application Service (depende apenas de interfaces)
      → Repository Interface (src/domain/repositories/)
          → MemoryRepository (src/infrastructure/memory/repositories/) — DEV
          → PostgresRepository (src/infrastructure/postgres/repositories/) — PROD

Regras:
- ❌ Service NUNCA importa Infrastructure
- ❌ Service NUNCA importa mock data
- ❌ Proibido Service Locator global
- ✅ Dependency Injection explícita via construtor/factory
```

---

## Fase 0: Entidades de Domínio
**Criar** `src/domain/entities/` — tipos puros de domínio, sem dependência externa

| Tarefa | Descrição |
|--------|-----------|
| 0.1 | Criar `src/domain/entities/` |
| 0.2 | `Restaurant.ts` — restaurante, categoria, cardápio |
| 0.3 | `Order.ts` — pedido, item, status |
| 0.4 | `Company.ts` — empresa, filial, plano |
| 0.5 | `User.ts` — usuário, auth, permissão |
| 0.6 | `Courier.ts` — entregador, entrega, rota |
| 0.7 | `Plan.ts` — plano, addon, assinatura, fatura |
| 0.8 | `Coupon.ts` — cupom, campanha |
| 0.9 | `CoverageCity.ts` — área de cobertura |
| 0.10 | `Notification.ts` — notificação |
| 0.11 | `SupportTicket.ts` — ticket de suporte |
| 0.12 | `AuditEvent.ts` — auditoria |
| 0.13 | `Review.ts` — avaliação |
| 0.14 | `FeatureFlag.ts` — feature flag |
| 0.15 | `Invoice.ts` — faturamento |
| 0.16 | `Loyalty.ts` — fidelidade |
| 0.17 | `Enterprise.ts` — demo data, plan limits |

**Critério:** Cada entidade é um tipo puro (interface/types). Zero imports de infraestrutura.

---

## Fase 1: Repository Interfaces (Domínio)
**Criar** `src/domain/repositories/` — interfaces que as entidades usam para persistência

| Tarefa | Descrição |
|--------|-----------|
| 1.1 | Criar `src/domain/repositories/` |
| 1.2 | `IMerchantRepository` — companies, branches, menu-items, orders, coupons, campaigns |
| 1.3 | `IRestaurantRepository` — restaurants, categories, menu-items |
| 1.4 | `IConsumerRepository` — orders, reviews, loyalty, addresses |
| 1.5 | `IAuthRepository` — users, sessions, login |
| 1.6 | `ISubscriptionRepository` — plans, addons, subscriptions, invoices |
| 1.7 | `IAdminRepository` — coverage-cities, global-coupons, notifications, audit |
| 1.8 | `ISuperadminRepository` — users, permissions, capabilities, features, reports |
| 1.9 | `IOperationsRepository` — hours, holidays, theme |
| 1.10 | `IEnterpriseRepository` — demo data, audit, plan-limits |

**Critério:** Interfaces usam tipos das entidades (Fase 0). Zero dependência de implementação.

---

## Fase 2: Infrastructure / Postgres (Estrutura Completa)
**Criar** `src/infrastructure/postgres/` — estrutura real, não apenas esqueleto vazio

| Tarefa | Descrição |
|--------|-----------|
| 2.1 | Criar `src/infrastructure/postgres/connection/` com factory de conexão |
| 2.2 | Criar `src/infrastructure/postgres/schema/` com schemas drizzle por domínio |
| 2.3 | Criar `src/infrastructure/postgres/migrations/` (referência às migrations existentes) |
| 2.4 | Criar `src/infrastructure/postgres/repositories/` implementando cada interface |
| 2.5 | `PostgresMerchantRepository` |
| 2.6 | `PostgresRestaurantRepository` |
| 2.7 | `PostgresConsumerRepository` |
| 2.8 | `PostgresAuthRepository` |
| 2.9 | `PostgresSubscriptionRepository` |
| 2.10 | `PostgresAdminRepository` |
| 2.11 | `PostgresSuperadminRepository` |
| 2.12 | `PostgresOperationsRepository` |
| 2.13 | `PostgresEnterpriseRepository` |

**Critério:** Cada PostgresRepository implementa a interface correspondente. Conexão injetada via construtor.

---

## Fase 3: Fixtures Individuais (Infrastructure/Memory/Data)
**Separar** dados mockados — cada entidade em seu próprio arquivo, máximo 300 linhas

| Tarefa | Descrição |
|--------|-----------|
| 3.1 | Criar `src/infrastructure/memory/data/` |
| 3.2 | `auth.ts` — usuarios, credenciais |
| 3.3 | `restaurants.ts` — restaurantes, categorias, itens |
| 3.4 | `merchant-companies.ts` |
| 3.5 | `merchant-branches.ts` |
| 3.6 | `merchant-menu-items.ts` |
| 3.7 | `merchant-orders.ts` |
| 3.8 | `merchant-coupons.ts` |
| 3.9 | `merchant-campaigns.ts` |
| 3.10 | `subscription-plans.ts` |
| 3.11 | `subscription-addons.ts` |
| 3.12 | `subscriptions.ts` |
| 3.13 | `invoices.ts` |
| 3.14 | `coverage-cities.ts` |
| 3.15 | `global-coupons.ts` |
| 3.16 | `notifications.ts` |
| 3.17 | `audit-events.ts` |
| 3.18 | `support-tickets.ts` |
| 3.19 | `feature-flags.ts` |
| 3.20 | `permissions.ts` |
| 3.21 | `capabilities.ts` |
| 3.22 | `commission-plans.ts` |
| 3.23 | `platform-metrics.ts` |
| 3.24 | `admin-users.ts` |
| 3.25 | `loyalty.ts` |
| 3.26 | `consumer-orders.ts` |
| 3.27 | `consumer-reviews.ts` |
| 3.28 | `operations.ts` |
| 3.29 | `theme.ts` |
| 3.30 | `enterprise.ts` — demo categories, products, companies, customers |
| 3.31 | `printing.ts` |
| 3.32 | `geocoding.ts` |

**Critério:** Nenhum arquivo > 300 linhas. `src/mocks/fixtures/` pode ser deletado após migração.

---

## Fase 4: MemoryRepository Implementations
**Criar** `src/infrastructure/memory/repositories/` — implementações concretas das interfaces

| Tarefa | Descrição |
|--------|-----------|
| 4.1 | `MemoryAuthRepository` |
| 4.2 | `MemoryRestaurantRepository` |
| 4.3 | `MemoryMerchantRepository` |
| 4.4 | `MemoryConsumerRepository` |
| 4.5 | `MemorySubscriptionRepository` |
| 4.6 | `MemoryAdminRepository` |
| 4.7 | `MemorySuperadminRepository` |
| 4.8 | `MemoryOperationsRepository` |
| 4.9 | `MemoryEnterpriseRepository` |

**Critério:** Dados vêm dos data files (Fase 3). Implementam interfaces (Fase 1). Usam tipos das entidades (Fase 0).

---

## Fase 5: Application Services
**Criar** `src/domain/services/` — dependem apenas de interfaces, NUNCA de infraestrutura

| Tarefa | Descrição |
|--------|-----------|
| 5.1 | Criar `src/domain/services/` |
| 5.2 | `MerchantService` — recebe `IMerchantRepository` no construtor |
| 5.3 | `RestaurantService` — recebe `IRestaurantRepository` |
| 5.4 | `ConsumerService` — recebe `IConsumerRepository` |
| 5.5 | `AuthService` — recebe `IAuthRepository` |
| 5.6 | `SubscriptionService` — recebe `ISubscriptionRepository` |
| 5.7 | `AdminService` — recebe `IAdminRepository` |
| 5.8 | `SuperadminService` — recebe `ISuperadminRepository` |
| 5.9 | `OperationsService` — recebe `IOperationsRepository` |
| 5.10 | `EnterpriseService` — recebe `IEnterpriseRepository` |

**Regras:**
- ✅ Service recebe repositório por **DI explícita** (constructor injection)
- ❌ Service NUNCA importa `src/infrastructure/`
- ❌ Service NUNCA importa mock data
- ❌ Proibido Service Locator / singleton global
- Service só conhece interfaces e entidades de domínio

---

## Fase 6: Ponto de Injeção (Factory / Composition Root)
**Criar** o composition root que monta o grafo de dependências

| Tarefa | Descrição |
|--------|-----------|
| 6.1 | `src/infrastructure/composition.ts` — factory que instancia Service + Repository |
| 6.2 | Provider de ambiente decide Memory ou Postgres |
| 6.3 | Hook `useService<T>()` ou provider React context |
| 6.4 | Em dev: `new MerchantService(new MemoryMerchantRepository())` |
| 6.5 | Em prod: `new MerchantService(new PostgresMerchantRepository(db))` |

**Critério:** Trocar de Memory para Postgres muda APENAS o composition root. Nenhuma página ou service alterado.

---

## Fase 7: Refatorar Páginas
**Substituir** imports diretos de mock data por chamadas a Application Services

| Tarefa | Descrição |
|--------|-----------|
| 7.1 | `EnterpriseDashboardPage` → `EnterpriseService` |
| 7.2 | `EnterpriseBranchesPage` → `EnterpriseService` |
| 7.3 | `DemoDataPage` → `EnterpriseService` |
| 7.4 | `usePlanLimits` → `SubscriptionService` + `EnterpriseService` |
| 7.5 | Atualizar `MockRestaurantProvider` → `MemoryRestaurantRepository` |
| 7.6 | Remover imports de `enterpriseData.ts` das páginas |

**Critério:** Zero imports de `enterpriseData.ts` ou `src/mocks/` na UI.

---

## Fase 8: Limpeza
**Remover** arquivos antigos

| Tarefa | Descrição |
|--------|-----------|
| 8.1 | Deletar `src/mocks/fixtures/` |
| 8.2 | Deletar `src/modules/enterprise/enterpriseData.ts` |
| 8.3 | Extrair dados inline de `handlers/printing.ts` e `handlers/proxy.ts` |
| 8.4 | Adaptar MSW handlers para consumir dos novos data files |
| 8.5 | Verificar `npm run build` e `npm run lint` |
| 8.6 | Verificar testes |

**Critério:** `npm run lint` 0 erros. `npm run build` ok. MSW handlers continuam funcionando.

---

## Critérios de Aprovação

| # | Critério | Como verificar |
|---|----------|----------------|
| 1 | Zero imports de `*.mock.ts` ou `enterpriseData.ts` na UI | `grep -r "enterpriseData" src/pages/ src/modules/` |
| 2 | Zero acesso direto a dados mockados pela UI | nenhum `demoProducts`, `demoCategories` em páginas |
| 3 | Cada domínio isolado em sua própria pasta | `src/domain/entities/`, `src/domain/repositories/` organizados |
| 4 | Nenhum arquivo de dados > 300 linhas | `Measure-Object -Line` em cada data file |
| 5 | Trocar Memory por Postgres sem alterar páginas | composition root é o único ponto de troca |
| 6 | Service não importa infraestrutura | `grep -r "infrastructure" src/domain/services/` = vazio |
| 7 | DI explícita, sem Service Locator | services têm constructor injection |
| 8 | Frontend funciona em dev com MemoryRepository | `npm run dev` com flag de ambiente |

---

## Arquivos Afetados (total estimado: ~90)

### Criar (~55):
| Diretório | Arquivos |
|-----------|:--------:|
| `src/domain/entities/` | 16 |
| `src/domain/repositories/` | 10 |
| `src/domain/services/` | 9 |
| `src/infrastructure/memory/data/` | 20 |
| `src/infrastructure/memory/repositories/` | 9 |
| `src/infrastructure/postgres/connection/` | 1 |
| `src/infrastructure/postgres/repositories/` | 9 |
| `src/infrastructure/composition.ts` | 1 |

### Modificar (~10):
- `src/modules/enterprise/pages/*.tsx` (3)
- `src/modules/enterprise/usePlanLimits.ts`
- `src/modules/superadmin/pages/DemoDataPage.tsx`
- `src/providers/restaurant/MockRestaurantProvider.ts`
- MSW handlers (4-5)

### Deletar (~7):
- `src/mocks/fixtures/` (6 arquivos + index)
- `src/modules/enterprise/enterpriseData.ts`
