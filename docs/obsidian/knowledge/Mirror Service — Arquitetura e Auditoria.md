---
type: knowledge
status: active
created_at: 2026-06-08
updated_at: 2026-06-08
tags:
  - type/knowledge
  - domain/backend
  - domain/data
  - tech/drizzle
related:
  - ADR-005 Mirror Service Atomicidade e Integridade.md
  - Arquitetura de Dados.md
  - Decisões Arquiteturais.md
---

# Mirror Service — Arquitetura e Auditoria

## Visão geral

O `mirrorService.createConsumerOrderWithMirror` (`server/src/services/orders/mirrorService.ts:66-182`) é responsável por criar um pedido consumer e seu espelho merchant em uma única operação lógica. A tabela `orders` (customer-side) é source of truth; `merchant_orders` (merchant-side) é view derivada com o mesmo `id`.

## Schema dual

```text
orders (customer)          merchant_orders (merchant)
├── id (PK, UUID)          ├── id (PK, = orders.id)
├── user_id (FK)           ├── branch_id (FK)
├── restaurant_id (FK)     ├── customer_name
├── address_id (FK)        ├── customer_phone
├── status                 ├── status ('new' = 'confirmed')
├── total                  ├── total
├── payment_method         └── created_at
└── created_at
                           merchant_order_items
order_items                   ├── id
├── id                        ├── merchant_order_id (FK)
├── order_id (FK)             ├── name
├── menu_item_id (FK)         ├── quantity
├── name                      └── price
├── quantity
├── price
├── additives (jsonb)
└── notes
```

> [!warning] Perda de dados no mirror
> `merchant_order_items` **NÃO tem** `menu_item_id`, `additives`, `notes`. Esses dados existem apenas no customer-side.

## Mapeamento de campos

| `orders` | `merchant_orders` | Transformação |
|----------|-------------------|---------------|
| `restaurant_id` | `branch_id` | Lookup via `findBranchForRestaurant` |
| `user_id` | `customer_name` + `customer_phone` | Lookup via `findUserById` |
| `address_id` | — | Não mapeado no mirror |
| `status: 'confirmed'` | `status: 'new'` | Semantic mapping |
| `payment_method: 'money'` | `payment_method: 'cash'` | Enum mapping |
| `payment_method: 'voucher'` | `payment_method: 'meal_ticket'` | Enum mapping |

## Problemas conhecidos

Ver [[ADR-005 Mirror Service Atomicidade e Integridade]] para decisão arquitetural.

### 🔴 Atomicidade comprometida

4 `db.insert()` sequenciais sem `db.transaction`. 6 de 7 cenários de falha produzem gravação parcial:

| Falha em | Resultado |
|----------|-----------|
| `orders.insert` | Nada criado (seguro) |
| `orderItems.insert` | Order órfão sem items |
| `merchantOrders.insert` | Order + items sem mirror |
| `merchantOrderItems.insert` | Mirror parcial |
| Crash de processo | Estado parcial permanente |

### 🔴 Fallback perigoso

`findBranchForRestaurant` (L55-64): se não encontra branch para o `restaurant_id`, retorna a **primeira branch do DB**. Pedidos são atribuídos à filial errada silenciosamente.

### 🟠 Zero idempotência

Sem `Idempotency-Key` ou constraint unique. Double-click em mobile cria pedidos duplicados.

### 🟠 FK implícita

`orders.id = merchantOrders.id` é convenção sem FK. Futuros endpoints podem divergir as tabelas.

## Recomendação

Migrar para `db.transaction` (Opção B). Ver [[ADR-005 Mirror Service Atomicidade e Integridade]].

## Queries de monitoramento

```sql
-- Orders sem mirror
SELECT o.id, o.created_at
FROM orders o
LEFT JOIN merchant_orders mo ON mo.id = o.id
WHERE mo.id IS NULL;

-- Orders sem items
SELECT o.id, o.created_at
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE oi.id IS NULL;

-- Mirror sem items
SELECT mo.id, mo.created_at
FROM merchant_orders mo
LEFT JOIN merchant_order_items moi ON moi.merchant_order_id = mo.id
WHERE moi.id IS NULL;
```

> [!tip] Navegação
> [[ADR-005 Mirror Service Atomicidade e Integridade]] · [[Arquitetura de Dados]] · [[Decisões Arquiteturais]]
