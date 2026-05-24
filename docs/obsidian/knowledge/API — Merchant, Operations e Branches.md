---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/api
- profile/merchant
- domain/commerce
---

# API — Merchant, Operations e Branches

## Companies

All routes under `/api/companies` require Bearer token.

### GET /api/companies

List all companies.

### GET /api/companies/:id/branches

List branches for a company.

## Branches

All routes under `/api/branches` require Bearer token.

### GET /api/branches

List all branches.

### GET /api/branches/:id/menu-items

List menu items for a branch.

### GET /api/branches/:id/orders

List orders for a branch.

## Orders

All routes under `/api/orders` require Bearer token.

### GET /api/orders

List all merchant orders.

### POST /api/orders/:id/status

Update order status. Triggers side effects:
- `accepted` → auto-print kitchen job (if addon active)
- `delivered` → loyalty points accrual

**Body:**

```json
{ "status": "accepted" }
```

Allowed values: `new`, `accepted`, `preparing`, `ready`, `dispatched`, `delivered`, `rejected`

**Response `200`:** `{ "success": true }`

## Operations

All routes under `/api/operations` require Bearer token.

### GET /api/operations/:branchId/status

Get current open/close status for a branch.

**Response `200`:**

```json
{
  "isOpen": true,
  "nextTransition": "2026-05-21T14:00:00.000Z",
  "status": "open"
}
```

### GET /api/operations/:branchId/today-periods

Get operating periods for today.

**Response `200`:** Array of time periods.

### GET /api/operations/:branchId/hours

Get weekly business hours with periods.

**Response `200`:** Array of business hour objects (one per weekday) with nested `periods`.

### PUT /api/operations/:branchId/hours

Replace weekly business hours (full replacement in transaction).

**Body:**

```json
{
  "hours": [
    {
      "weekday": "monday",
      "isClosed": false,
      "is24h": false,
      "sortOrder": 0,
      "periods": [
        { "openTime": "08:00", "closeTime": "12:00", "sortOrder": 0 },
        { "openTime": "14:00", "closeTime": "18:00", "sortOrder": 1 }
      ]
    }
  ]
}
```

**Response `200`:** `{ "success": true, "branchId": "uuid" }`

### GET /api/operations/:branchId/holiday-overrides

List holiday overrides for a branch.

### POST /api/operations/:branchId/holiday-overrides

Create a holiday override.

**Body:**

```json
{
  "holidayRuleId": "uuid",
  "overrideType": "custom_hours",
  "customDate": "2026-12-25",
  "periods": [
    { "openTime": "10:00", "closeTime": "16:00", "sortOrder": 0 }
  ]
}
```

`overrideType`: `closed`, `open_normal`, `custom_hours`

**Response `201`:** `{ "success": true, "id": "uuid" }`

### DELETE /api/operations/:branchId/holiday-overrides/:id

Delete a holiday override.

### GET /api/operations/:branchId/special-dates

List special dates for a branch.

### POST /api/operations/:branchId/special-dates

Create a special date.

**Body:**

```json
{
  "date": "2026-06-12",
  "label": "Dia dos Namorados",
  "isClosed": false,
  "is24h": false,
  "periods": [
    { "openTime": "09:00", "closeTime": "22:00", "sortOrder": 0 }
  ]
}
```

**Response `201`:** `{ "success": true, "id": "uuid" }`

### DELETE /api/operations/:branchId/special-dates/:id

Delete a special date.

## Holidays

All routes under `/api/holidays` require Bearer token.

### GET /api/holidays

List all holiday rules.

### GET /api/holidays/date/:date

Get holidays for a specific date (format: `YYYY-MM-DD`).

### POST /api/holidays

Create a holiday rule.

**Body:**

```json
{
  "name": "Natal",
  "date": "2026-12-25",
  "scope": "national",
  "stateCode": null,
  "cityCode": null,
  "isRecurring": true,
  "year": null
}
```

`scope`: `national`, `state`, `municipal`

**Response `201`:** `{ "success": true, "id": "uuid" }`

### DELETE /api/holidays/:id

Delete a holiday rule.

### POST /api/holidays/seed/:year

Seed Brazilian national holidays for a given year (e.g., `2026`).

**Response `200`:**

```json
{ "seeded": 12, "year": 2026 }
```

## Branch Settings

Routes under `/api/branch-settings` require Bearer token with `merchant`, `admin`, or `superadmin` role. Scoped via tenant ownership.

### GET /api/branch-settings/:branchId

Get branch settings.

### PUT /api/branch-settings/:branchId

Create or update branch settings.

**Body:**

```json
{
  "opening_time": "08:00",
  "closing_time": "22:00",
  "preparation_time": "30",
  "minimum_order": "15.00",
  "accepts_delivery": true,
  "accepts_pickup": true,
  "pix_key": "email@example.com"
}
```

## Printing

All routes require Bearer token with `superadmin`, `admin`, or `merchant` role. Scoped via tenant ownership.

### GET /api/printing/config/:branchId

Get printer configuration for a branch.

### PUT /api/printing/config/:branchId

Create or update printer configuration.

**Body (partial):**

```json
{
  "printer_type": "network",
  "ip_address": "192.168.1.100",
  "port": 9100,
  "model": "Epson TM-T20",
  "enabled": true
}
```

### GET /api/printing/history/:branchId

List print jobs for a branch (ordered by `created_at`).

> [!tip] Navegação
> [[API]] · [[API — Restaurants, Menu, Reviews e Coverage]] · [[Estrutura do Backend]]
