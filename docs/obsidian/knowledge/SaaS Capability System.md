---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/architecture
- domain/commerce
---

# SaaS Capability System

## Visão Geral

Gates paid features by resolving plan, addon, feature flag, and billing status. Implementado em `src/modules/saas/`.

## Feature Resolution Order (`resolveFeatureAccess`)

```
1. Billing status check → blocked/cancelled → disabled
2. Manual feature flag (highest priority):
   a. User-level override
   b. Branch-level override
   c. Company-level override
3. Plan-level: feature included in base plan?
4. Addon-level: feature provided by a purchased addon?
```

## Componentes

- **`FeatureRoute`** — Route guard. Wraps merchant routes. Shows "Recurso indisponível" if access denied.
- **`FeatureGate`** — Inline component guard for granular UI toggles.
- **`useFeatureAccess`** — Hook returning `{ enabled, reason }` given companyId, featureKey, optional branchId.
- **`capabilityCatalog`** — Static catalog of 17 capabilities with pricing, dependencies, category, required plan.
- **`saasAccess.ts`** — Pure functions: `resolveFeatureAccess`, `calculateSubscriptionTotal`.
- **Types**: `PlanId`, `FeatureKey`, `BillingStatus`, `SaasPlan`, `SaasAddon`, `CompanySubscription`, `FeatureFlagOverride`, `SaasCapability`, `CapabilityCategory`.

## Plans

`basic`, `pro`, `premium`.

## Modelo de Negócio

Instead of simple role-based access for merchant features, a full SaaS capability system:
- Plans (`basic` / `pro` / `premium`) define base features
- Addons provide additional features (e.g., `campaigns`, `analytics`, `financial_suite`)
- Feature flags allow manual override at company/branch/user level
- Billing status (trial, active, past_due, blocked, cancelled) gates access

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[MOC — Perfis do Sistema]] · [[ARCHITECTURE]]
