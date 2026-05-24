---
title: API Reference
aliases:
- API
- Endpoints
- Rotas
- API Reference
- Referencia API
section: architecture
tags:
- domain/api
---

# Flux Delivery — API Reference

> [!abstract] Hub de API
> Referência completa de endpoints. Seções detalhadas estão em notas especializadas — siga os wikilinks.

**Base URL:** `http://localhost:3001/api`
**Auth Header:** `Authorization: Bearer <token>`

---

## Seções Especializadas

| Nota | Conteúdo |
|------|----------|
| [[API — Health, Metrics e Auth]] | Health probes, Prometheus metrics, login, register, refresh, logout, forgot/reset password, me |
| [[API — Restaurants, Menu, Reviews e Coverage]] | Restaurants CRUD, categories, menu items, coverage cities, reviews, theme |
| [[API — Merchant, Operations e Branches]] | Companies, branches, orders, operations, holidays, branch settings, printing |
| [[API — Commerce, Coupons e Loyalty]] | Global coupons, merchant coupons, campaigns, coupon validation, loyalty |
| [[API — SaaS, Admin, Permissions e Consumer]] | Plans, capabilities, subscriptions, addons, feature flags, invoices, admin users, reports, notifications, audit, support tickets, permissions, consumer endpoints |

---

## Resumo de Rotas (35+ endpoints)

### Públicas (sem JWT)

| Prefixo | Descrição |
|---------|-----------|
| `/api/health/*` | Liveness, readiness, combined |
| `/api/metrics` | Prometheus metrics |
| `/api/auth/*` | Login, register, refresh, forgot/reset password |
| `/api/restaurants` | List/detail + menu items |
| `/api/categories` | Food categories |
| `/api/menu-items` | Menu items |
| `/api/coverage-cities` | City coverage |
| `/api/reviews` | Public reviews |
| `/api/plans` | SaaS plans |
| `/api/capabilities` | Capability catalog |
| `/api/theme` | Theme configuration |

### Protegidas (JWT required)

| Prefixo | Descrição |
|---------|-----------|
| `/api/companies` | Company management |
| `/api/branches` | Branch management |
| `/api/orders` | Consumer orders |
| `/api/operations` | Business hours, special dates |
| `/api/holidays` | Holiday rules + seed |
| `/api/global-coupons` | Global coupons (superadmin/admin) |
| `/api/merchant-coupons` | Merchant coupons (scoped) |
| `/api/campaigns` | Marketing campaigns |
| `/api/subscriptions` | SaaS subscriptions |
| `/api/subscription-addons` | Addon toggle |
| `/api/invoices` | Billing invoices |
| `/api/admin/users` | User management (superadmin) |
| `/api/addons` | SaaS addon management |
| `/api/feature-flags` | Feature flag overrides |
| `/api/notifications` | Notifications |
| `/api/audit-events` | Audit trail (paginated) |
| `/api/support-tickets` | Support tickets |
| `/api/branch-settings` | Branch configuration |
| `/api/commission-plans` | Commission plans |
| `/api/admin/reports` | Platform metrics |
| `/api/loyalty` | Loyalty program |
| `/api/coupons/validate` | Coupon validation engine |
| `/api/printing` | Kitchen auto-print |
| `/api/permissions` | Role-permission management |
| `/api/me/orders` | Consumer orders |
| `/api/me/notifications` | Consumer notifications |

---

## Error Response Format

All API errors follow a consistent JSON structure:

```json
{
  "error": "Human-readable error message"
}
```

**HTTP status codes used:**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized / missing or invalid token |
| 403 | Forbidden / insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate email) |
| 500 | Internal server error |
| 503 | Service unavailable (health check) |

---

> [!tip] Navegação
> [[Rotas da API]] · [[MOC — Arquitetura do Sistema]] · [[Authentication Flow]]
