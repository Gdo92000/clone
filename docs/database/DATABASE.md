---
title: Database
aliases:
- Banco de Dados
- DB
- PostgreSQL
- Drizzle Schema
- Schema
section: architecture
tags:
- domain/database
---

# Flux Delivery — Database

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Banco | PostgreSQL (Supabase) |
| ORM | Drizzle ORM 0.45 |
| Validação | Zod 4 |
| Cliente SQL | `postgres-js` |

## Schema — 45 tabelas

Organizado em **7 domínios** modulares em `server/src/db/schema/`:

### core (4)
`categories`, `restaurants`, `menuItems`, `additives`

### customer (5)
`users`, `addresses`, `orders`, `orderItems`, `reviews`

### merchant (6)
`companies`, `branches`, `branchSettings`, `merchantOrders`, `merchantOrderItems`, `merchantMenuItems`

### commerce (6)
`globalCoupons`, `merchantCoupons`, `campaigns`, `loyaltySettings`, `userLoyaltyPoints`, `loyaltyRewards`

### saas (8)
`plans`, `capabilities`, `subscriptions`, `invoices`, `addons`, `subscriptionAddons`, `commissionPlans`, `feature_flags`

### ops (8)
`notifications`, `userNotifications`, `coverageCities`, `auditEvents`, `supportTickets`, `permissions`, `printerConfigs`, `printJobs`

### operations (8)
`authSessions`, `passwordResets`, `auditLogs`, `businessHours`, `businessHourPeriods`, `holidayRules`, `holidayOverrides`, `specialDates`

## Índices

~58 índices definidos em `server/src/db/schema/indexes.ts`, organizados por domínio. Destaques:

- `idx_coverage_cities_name_state` — cobertura geo-espacial por cidade/estado
- `idx_orders_user (user_id, created_at DESC)` — histórico de pedidos do cliente
- `idx_merchant_orders_branch (branch_id, status)` — fila de pedidos do estabelecimento
- `idx_feature_flags_company/branch/user` — feature flags por escopo

## Providers

| Modo | Provider | Uso |
|------|----------|-----|
| **postgres** | drizzle + postgres-js | Dev / Produção (requer `DATABASE_URL`) |
| **memory** | `BaseMemoryRepository` | Testes (`NODE_ENV=test`) ou `DATABASE_PROVIDER=memory` |

### Migrations

```sh
npm run db:generate    # drizzle-kit generate
npm run db:migrate     # drizzle-kit migrate
npm run db:studio      # drizzle-kit studio
```

Arquivos de migration em `drizzle/`.

---

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[Arquitetura de Dados]]
