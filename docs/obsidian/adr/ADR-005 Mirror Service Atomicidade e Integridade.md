---
title: ADR-005 Mirror Service Atomicidade e Integridade
type: adr
status: proposed
created_at: 2026-06-08
updated_at: 2026-06-08
tags:
  - type/adr
  - domain/backend
  - domain/data
  - tech/drizzle
supersedes: null
related:
  - ADR Index.md
  - MEMORY.md
  - CURRENT_STATE.md
---

# ADR-005: Mirror Service — Atomicidade e Integridade

## Contexto

O `mirrorService.createConsumerOrderWithMirror` (`server/src/services/orders/mirrorService.ts:66-182`) cria pedidos em 2 schemas do banco (`customer.orders` + `merchant.merchant_orders`) usando 4 `db.insert()` sequenciais **fora de transação**. A auditoria técnica de 2026-06-08 identificou 6 cenários de gravação parcial, zero idempotência, e um fallback perigoso em `findBranchForRestaurant`.

### Motivação original (Fase 33.0)

O `db.transaction` foi abandonado durante a Fase 33.0 por causa de lint issues com o proxy `db` (ESLint strict-type-checked infere `unknown` para property access em novos arquivos). A justificativa foi considerada prática na época, mas a auditoria revelou que **o pattern `db.transaction` já funciona em `server/src/routes/orders.ts:60-133`** — a divergência foi prematura.

## Decisão

**Adotar Opção B: migrar para `db.transaction`** com 3 correções adicionais.

### Correções prioritárias

| # | Correção | Severidade | Descrição |
|---|----------|-----------|-----------|
| 1 | `db.transaction` no mirrorService | 🔴 Alta | 4 inserts dentro de `db.transaction(async (tx) => { ... })`. Qualquer falha → rollback automático. |
| 2 | Remover fallback branch | 🔴 Alta | `findBranchForRestaurant` deve lançar `BRANCH_NOT_FOUND` em vez de retornar primeira branch. |
| 3 | Validar `menu_item_id` | 🟠 Média | Antes do insert, verificar que todos `input.items[].menu_item_id` existem em `menuItems`. |
| 4 | `Idempotency-Key` header | 🟠 Média | POST `/me/orders` aceita header `Idempotency-Key`; tabela `idempotency_keys` deduplica retries. |

### Opções consideradas

| Opção | Atomicidade | Compatibilidade | Risco | Veredicto |
|-------|-------------|-----------------|-------|-----------|
| A. Manter + cleanup no catch | Parcial | 100% | ALTO (cleanup pode falhar) | ❌ |
| **B. `db.transaction`** | **Total** | **100%** | **BAIXO** | ✅ |
| C. Unificar tabelas (drop merchantOrders) | Total | Quebra rotas merchant | MÉDIO | ❌ agora |
| D. Outbox pattern + background job | Eventual | 100% | BAIXO (latência) | ⚠ scale alta |
| E. Soft delete + reconcile job | Eventual | 100% | MÉDIO | ⚠ complexidade |

## Consequências

### Positivas

- Elimina 6 cenários de gravação parcial — qualquer falha faz rollback automático
- Consistente com pattern existente (`server/src/routes/orders.ts`)
- `tx` (parâmetro da callback) tem tipo concreto — resolve lint issue do proxy `db`
- Cliente pode retry com segurança (sem órfãos)

### Negativas

- Transação bloqueia rows por mais tempo (4 inserts ~5ms) — impacto desprezível
- `db.transaction` não funciona em modo `memory` — mas rotas consumer já usam postgres diretamente
- Idempotency-Key requer tabela nova + middleware — complexidade adicional

### Pendências futuras

- Adicionar FK `merchantOrders.id → orders.id` (refactor de schema)
- Adicionar query de monitoramento de órfãos (reconciliação)
- Adicionar rate limiting no POST `/me/orders`
- Revisar se `db.transaction` resolve lint issue do proxy (se sim, reverter abandono do repository pattern)

## Referências

- `server/src/services/orders/mirrorService.ts` — alvo da correção
- `server/src/routes/orders.ts:60-133` — pattern `db.transaction` existente
- `server/src/db/index.ts:26-35` — proxy `db` que causa lint issues
- [[MEMORY]] — seção "Aprendizados da Auditoria MirrorService"
- [[CURRENT_STATE]] — seção "Auditoria Técnica do MirrorService"
