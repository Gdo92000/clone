---
title: LOOP 4 — Auditoria Arquitetural
type: worklog
status: concluded
created_at: 2026-06-12
updated_at: 2026-06-12
related:
  - MEMORY.md
  - CURRENT_STATE.md
  - server/src/services/orderService.ts
  - server/src/services/analyticsService.ts
  - server/src/services/couponService.ts
  - server/src/services/financeService.ts
  - ADR-008 Repository Pattern para novos módulos
  - ADR-006 PostgreSQL Concrete vs Generic Schema
  - ADR-007 Test Pattern
  - docs/obsidian/adr/ADR Index.md
tags:
  - type/worklog
  - loop/4
---

# LOOP 4 — Auditoria Arquitetural (System Contract)

## Escopo

Extrair lógica de negócio de rotas para serviços dedicados, seguindo sequência segura (menor risco ao maior). Aplicar System Contract para garantir conformidade arquitetural.

## Serviços Extraídos

| Rota (antes) | Linhas antes | Serviço criado | Linhas depois |
|-------------|:-----------:|---------------|:------------:|
| `orders.ts` | 296 | `orderService.ts` (285) | 37 |
| `merchant-finance.ts` | 115 | `financeService.ts` (121) | 25 |
| `merchant-analytics.ts` | 85 | `analyticsService.ts` (71) | 21 |
| `coupons-engine.ts` | 58 | `couponService.ts` (56) | 20 |

- **~112 queries DB diretas** removidas das rotas
- **11 serviços legados** importam `db` diretamente — documentados como violação residual

## Decisões

1. **Repository Pattern obrigatório para novos módulos** (ADR-008 aprovado)
2. **Serviços legados sem refatoração retroativa** — apenas sob gatilho (troca de ORM, bug, feature request)
3. **Nenhuma refatoração no módulo Merchant** (recém-estabilizado)
4. **Tipos concretos > genéricos** no schema DB (ADR-006)

## ADRs criados

- ADR-006 — PostgreSQL Concrete vs Generic Schema
- ADR-007 — Test Pattern (padrões de teste do projeto)
- ADR-008 — Repository Pattern para novos módulos

## Resultado

| Métrica | Valor |
|---------|-------|
| Rotas enxugadas | 4 |
| Serviços criados | 4 |
| Queries DB diretas removidas das rotas | ~112 |
| Testes inalterados | 86/87 pass (1 flaky timeout) |
| Violação residual | 11 serviços importam `db` direto |
