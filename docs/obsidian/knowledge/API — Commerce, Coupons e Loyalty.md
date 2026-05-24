---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/api
- domain/commerce
---

# API — Commerce, Coupons e Loyalty

## Global Coupons

All routes require Bearer token with `superadmin` or `admin` role.

### GET /api/global-coupons

List all global coupons.

### GET /api/global-coupons/:id

Get a global coupon by ID.

### POST /api/global-coupons

Create a global coupon.

**Body:**

```json
{
  "code": "BLACKFRIDAY",
  "description": "Black Friday 2026",
  "discount_type": "percentage",
  "discount_value": "15.00",
  "min_order": "50.00",
  "max_uses": 1000,
  "valid_from": "2026-11-25T00:00:00.000Z",
  "valid_until": "2026-11-30T23:59:59.000Z"
}
```

### PUT /api/global-coupons/:id

Update a global coupon.

### DELETE /api/global-coupons/:id

Soft-delete (sets `is_active: false`).

## Merchant Coupons

All routes require Bearer token with `superadmin`, `admin`, or `merchant` role. Scoped to the user's company/branch.

### GET /api/merchant-coupons

List merchant coupons. Supports `?branch_id=` filter.

### GET /api/merchant-coupons/:id

Get a merchant coupon.

### POST /api/merchant-coupons

Create a merchant coupon.

**Body:**

```json
{
  "branch_id": "uuid",
  "code": "PIZZA10",
  "description": "10% off pizzas",
  "discount_type": "percentage",
  "discount_value": "10.00",
  "min_order": "0",
  "max_uses": 50,
  "valid_until": "2026-12-31T23:59:59.000Z"
}
```

### PUT /api/merchant-coupons/:id

Update a merchant coupon.

### DELETE /api/merchant-coupons/:id

Soft-delete (sets `is_active: false`).

## Campaigns

All routes require Bearer token with `superadmin`, `admin`, or `merchant` role. Scoped to the user's company/branch.

### GET /api/campaigns

List campaigns. Supports `?branch_id=` filter.

### GET /api/campaigns/:id

Get a campaign.

### POST /api/campaigns

Create a campaign.

**Body:**

```json
{
  "branch_id": "uuid",
  "name": "Summer Sale",
  "description": "Summer discounts",
  "discount_percentage": "10",
  "status": "active",
  "starts_at": "2026-01-01T00:00:00.000Z",
  "ends_at": "2026-03-01T00:00:00.000Z"
}
```

### PUT /api/campaigns/:id

Update a campaign.

### DELETE /api/campaigns/:id

Hard-delete a campaign.

## Coupon Validation Engine

All routes require Bearer token.

### POST /api/coupons/validate

Validate a coupon code and calculate discount.

**Body:**

```json
{
  "code": "PIZZA10",
  "branchId": "uuid",
  "orderTotal": "59.90"
}
```

**Response `200`:**

```json
{
  "success": true,
  "discount": 5.99,
  "newTotal": 53.91,
  "couponName": "PIZZA10"
}
```

**Error responses:**

- `404`: `{ "error": "Cupom inválido para esta loja" }`
- `400`: `{ "error": "Este cupom não está mais ativo" }`
- `400`: `{ "error": "Este cupom expirou" }`
- `400`: `{ "error": "Limite de usos atingido" }`
- `400`: `{ "error": "Valor mínimo do pedido para este cupom é R$ ..." }`
- `400`: `{ "error": "Este cupom é válido apenas para o primeiro pedido" }`

## Loyalty

### Consumer routes (JWT required)

#### GET /api/loyalty/me/loyalty

Get user loyalty balance, settings, and available rewards for a branch.

**Query:** `?branch_id=uuid`

#### POST /api/loyalty/me/loyalty/redeem

Redeem a reward.

**Body:**

```json
{
  "rewardId": "uuid",
  "branchId": "uuid"
}
```

### Merchant routes (JWT + `superadmin`|`admin`|`merchant` + tenant ownership)

#### GET /api/loyalty/settings/:branchId

Get loyalty program settings.

#### PUT /api/loyalty/settings/:branchId

Update loyalty program settings.

**Body:**

```json
{
  "enabled": true,
  "points_per_real": "1.00"
}
```

#### GET /api/loyalty/rewards/:branchId

List loyalty rewards for a branch.

#### POST /api/loyalty/rewards

Create a reward.

**Body:**

```json
{
  "branch_id": "uuid",
  "name": "R$10 off",
  "points_required": 100,
  "discount_value": "10.00",
  "discount_type": "fixed"
}
```

#### PUT /api/loyalty/rewards/:id

Update a reward.

#### DELETE /api/loyalty/rewards/:id

Delete a reward.

> [!tip] Navegação
> [[API]] · [[SaaS Capability System]] · [[API — Restaurants, Menu, Reviews e Coverage]]
