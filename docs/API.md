# Flux Delivery — API Reference

**Base URL:** `http://localhost:3001/api`
**Auth Header:** `Authorization: Bearer <token>`

---

## 1. Health & Metrics

### GET /api/health/live

Liveness probe — always returns ok.

**Auth:** None

**Response `200`:**

```json
{
  "status": "ok",
  "timestamp": "2026-05-21T12:00:00.000Z",
  "uptime": 123.45,
  "requestId": "uuid"
}
```

### GET /api/health/ready

Readiness probe — checks database connectivity.

**Auth:** None

**Response `200`:**

```json
{
  "status": "ok",
  "timestamp": "2026-05-21T12:00:00.000Z",
  "uptime": 123.45,
  "database": "ok",
  "requestId": "uuid"
}
```

**Response `503`** (database down):

```json
{
  "status": "degraded",
  "database": "down"
}
```

### GET /api/health

Combined health check (alias for `/api/health/ready`).

**Auth:** None

### GET /api/metrics

Prometheus metrics (text/plain). Includes default metrics prefixed `fluxds_` and custom HTTP metrics (request count, duration, errors, active requests).

**Auth:** None

---

## 2. Auth

### POST /api/auth/login

Authenticate with email and password.

**Auth:** None
**Rate limit:** 10 req / 60s

**Body:**

```json
{
  "email": "user@example.com",
  "password": "s3cr3t"
}
```

**Response `200`:**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "uuid",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

**Response `401`:**

```json
{ "error": "Email ou senha inválidos" }
```

### POST /api/auth/register

Create a new customer account.

**Auth:** None
**Rate limit:** 5 req / 60s

**Body:**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "s3cr3t"
}
```

**Response `201`:**

```json
{ "success": true, "id": "uuid" }
```

**Response `409`:**

```json
{ "error": "Email já cadastrado" }
```

### POST /api/auth/refresh

Exchange a refresh token for a new access token.

**Auth:** None
**Rate limit:** 10 req / 60s

**Body:**

```json
{
  "refreshToken": "uuid-from-login"
}
```

**Response `200`:**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "new-uuid"
}
```

**Response `401`:**

```json
{ "error": "Token inválido" }
```

### POST /api/auth/forgot-password

Request password reset email (generates token; always returns success to prevent email enumeration).

**Auth:** None
**Rate limit:** 3 req / 60s

**Body:**

```json
{ "email": "user@example.com" }
```

**Response `200`:**

```json
{ "success": true, "message": "Se o email existir, um link de recuperação será enviado." }
```

### POST /api/auth/reset-password

Reset password using token received via email.

**Auth:** None
**Rate limit:** 5 req / 60s

**Body:**

```json
{
  "token": "token-from-email",
  "password": "new-password"
}
```

**Response `200`:**

```json
{ "success": true, "message": "Senha alterada com sucesso." }
```

**Response `400`:**

```json
{ "error": "Token inválido ou expirado" }
```

### POST /api/auth/logout

Revoke current session.

**Auth:** Bearer token

**Response `200`:**

```json
{ "success": true }
```

### GET /api/auth/me

Get current authenticated user profile.

**Auth:** Bearer token

**Response `200`:**

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "customer",
  "phone": null,
  "company_id": null,
  "branch_id": null
}
```

**Response `401`:**

```json
{ "error": "Não autenticado" }
```

---

## 3. Restaurants

### GET /api/restaurants

List all restaurants.

**Auth:** None

**Response `200`:** Array of restaurant objects.

### GET /api/restaurants/:id

Get a restaurant by ID.

**Auth:** None

**Path params:** `id` (string, 1-64 chars)

**Response `200`:** Restaurant object.

**Response `404`:** `{ "error": "Not found" }`

### GET /api/restaurants/:id/menu-items

List menu items for a restaurant.

**Auth:** None

**Path params:** `id` (string, 1-64 chars)

**Response `200`:** Array of menu item objects.

### POST /api/restaurants

Create a new restaurant.

**Auth:** Bearer token (requires `superadmin` or `admin` role)

**Body:**

```json
{
  "name": "Pizza Planet",
  "description": "Best pizza in town",
  "cuisine": "pizza",
  "categoryId": "uuid",
  "address": "123 Main St",
  "number": "42",
  "neighborhood": "Downtown",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01001-000",
  "phone": "+5511999999999",
  "deliveryFee": 5.0,
  "deliveryTime": "30-45 min",
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

**Response `201`:**

```json
{ "success": true, "id": "uuid" }
```

---

## 4. Categories

### GET /api/categories

List all categories (sorted by name).

**Auth:** None

**Response `200`:** Array of category objects.

---

## 5. Menu Items

### GET /api/menu-items

List all menu items.

**Auth:** None

**Response `200`:** Array of menu item objects.

### GET /api/menu-items/:id

Get a menu item by ID.

**Auth:** None

**Response `200`:** Menu item object.

**Response `404`:** `{ "error": "Not found" }`

---

## 6. Coverage Cities

### GET /api/coverage-cities

List coverage cities.

**Auth:** None

**Response `200`:** Array of coverage city objects.

### GET /api/coverage-cities/:id

Get a coverage city by ID.

**Auth:** None

**Response `200`:** Coverage city object.

**Response `404`:** `{ "error": "Not found" }`

### POST /api/coverage-cities/admin

Create a coverage city.

**Auth:** Bearer token (requires `superadmin` or `admin`)

**Body:**

```json
{
  "name": "São Paulo",
  "state": "SP",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "radiusKm": 50
}
```

**Response `201`:** Coverage city object.

### PUT /api/coverage-cities/admin/:id

Update a coverage city.

**Auth:** Bearer token (requires `superadmin` or `admin`)

**Body:** Partial fields of create schema.

**Response `200`:** Updated coverage city object.

### PATCH /api/coverage-cities/admin/:id/toggle

Toggle a coverage city's active status.

**Auth:** Bearer token (requires `superadmin` or `admin`)

**Response `200`:** Updated coverage city object.

### DELETE /api/coverage-cities/admin/:id

Delete a coverage city.

**Auth:** Bearer token (requires `superadmin` or `admin`)

**Response `200`:** `{ "success": true }`

### POST /api/coverage-cities/admin/seed

Seed coverage cities from restaurant data.

**Auth:** Bearer token (requires `superadmin` or `admin`)

**Response `200`:** Seeding result.

---

## 7. Plans

### GET /api/plans

List active plans.

**Auth:** None

**Response `200`:** Array of plan objects (only `is_active: true`).

### GET /api/plans/:id

Get a plan by ID (one of `basic`, `pro`, `premium`).

**Auth:** None

**Response `200`:** Plan object.

**Response `404`:** `{ "error": "Not found" }`

### POST /api/plans

Create a new plan.

**Auth:** Bearer token (requires `superadmin` or `admin`)

**Body:**

```json
{
  "name": "Pro",
  "monthly_price": "79.90",
  "description": "Pro plan",
  "max_branches": 5,
  "max_products": 100,
  "max_users": 10,
  "max_campaigns": 20,
  "is_active": true
}
```

**Response `201`:** `{ "success": true }`

### PUT /api/plans/:id

Update a plan.

**Auth:** Bearer token (requires `superadmin` or `admin`)

**Path params:** `id` (`basic`|`pro`|`premium`)

**Body:** Partial fields of create schema.

**Response `200`:** `{ "success": true }`

---

## 8. Capabilities

### GET /api/capabilities

List all capabilities.

**Auth:** None

**Response `200`:** Array of capability objects.

### POST /api/capabilities

Create a capability.

**Auth:** Bearer token (requires `superadmin` or `admin`)

**Body:**

```json
{
  "feature_key": "advanced_reports",
  "name": "Advanced Reports",
  "description": "Generate advanced reports",
  "monthly_price": "19.90",
  "category": "analytics",
  "charge_type": "monthly_addon",
  "required_plan": "pro",
  "dependencies": []
}
```

**Response `201`:** `{ "success": true, "id": "uuid" }`

### PUT /api/capabilities/:id

Update a capability.

**Auth:** Bearer token (requires `superadmin` or `admin`)

**Body:** Partial fields of create schema.

**Response `200`:** `{ "success": true }`

### DELETE /api/capabilities/:id

Delete a capability.

**Auth:** Bearer token (requires `superadmin` or `admin`)

**Response `200`:** `{ "success": true }`

---

## 9. Theme

### GET /api/theme/me/theme

Get theme config for the resolved company domain.

**Auth:** None (resolved via domain middleware)

**Response `200`:**

```json
{ "theme": "default" }
```

---

## 10. Reviews

### GET /api/reviews

List reviews. Optional query param `restaurant_id` to filter.

**Auth:** None

**Query:** `?restaurant_id=uuid`

**Response `200`:** Array of review objects with `author_name`.

### GET /api/reviews/restaurant/:id

List reviews for a specific restaurant.

**Auth:** None

**Response `200`:** Array of review objects with `author_name`.

### POST /api/reviews

Create a review (protected route under `/api` — requires JWT).

**Auth:** Bearer token

**Body:**

```json
{
  "restaurant_id": "uuid",
  "order_id": "uuid",
  "rating": 5,
  "comment": "Excellent!"
}
```

**Response `201`:** `{ "success": true, "id": "uuid" }`

---

## 11. Companies

All routes under `/api/companies` require Bearer token.

### GET /api/companies

List all companies.

### GET /api/companies/:id/branches

List branches for a company.

---

## 12. Branches

All routes under `/api/branches` require Bearer token.

### GET /api/branches

List all branches.

### GET /api/branches/:id/menu-items

List menu items for a branch.

### GET /api/branches/:id/orders

List orders for a branch.

---

## 13. Orders

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

---

## 14. Operations

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

---

## 15. Holidays

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

---

## 16. Global Coupons

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

---

## 17. Merchant Coupons

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

---

## 18. Campaigns

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

---

## 19. Subscriptions

All routes require Bearer token with `superadmin` or `admin` role.

### GET /api/subscriptions

List all subscriptions.

### GET /api/subscriptions/:id

Get subscription by company ID.

### POST /api/subscriptions

Create or upsert a subscription.

**Body:**

```json
{
  "company_id": "uuid",
  "plan_id": "pro",
  "addon_ids": ["uuid1", "uuid2"],
  "billing_status": "trial",
  "trial_ends_at": "2026-06-01T00:00:00.000Z",
  "current_period_ends_at": "2026-07-01T00:00:00.000Z",
  "blocked_reason": null
}
```

### PUT /api/subscriptions/:id

Update a subscription.

---

## 20. Subscription Addons

All routes require Bearer token with `superadmin` role.

### POST /api/subscription-addons/toggle

Toggle an addon on/off for a subscription.

**Body:**

```json
{
  "subscriptionId": "uuid",
  "addonId": "uuid"
}
```

**Response `200`:**

```json
{ "success": true, "active": true }
```

---

## 21. Invoices

All routes require Bearer token with `superadmin` or `admin` role.

### GET /api/invoices

List all invoices.

### GET /api/invoices/:id

Get invoices by company ID.

---

## 22. Admin Users

All routes require Bearer token with `superadmin` role.

### GET /api/admin/users

List all users (excluding `password_hash`).

### GET /api/admin/users/:id

Get a user by ID (excluding `password_hash`).

### PUT /api/admin/users/:id

Update a user.

**Body (partial):**

```json
{
  "name": "Updated Name",
  "email": "new@example.com",
  "phone": "+5511999999999",
  "role": "merchant",
  "is_active": true,
  "company_id": "uuid",
  "branch_id": "uuid"
}
```

---

## 23. Addons

All routes require Bearer token with `superadmin` or `admin` role.

### GET /api/addons

List active addons (`is_active: true`).

### GET /api/addons/:id

Get an addon by ID.

### POST /api/addons

Create an addon.

**Body:**

```json
{
  "name": "Kitchen Auto Print",
  "description": "Auto-print orders in kitchen",
  "monthly_price": "29.90",
  "feature_key": "kitchen_auto_print"
}
```

### PUT /api/addons/:id

Update an addon.

### DELETE /api/addons/:id

Soft-delete (sets `is_active: false`).

---

## 24. Feature Flags

All routes require Bearer token with `superadmin` or `admin` role.

### GET /api/feature-flags

List feature flags. Supports `?company_id=` and `?branch_id=` filters.

### POST /api/feature-flags

Create or upsert a feature flag.

**Body:**

```json
{
  "company_id": "uuid",
  "branch_id": "uuid",
  "user_id": "uuid",
  "feature_key": "new_checkout_flow",
  "enabled": true,
  "reason": "Testing new checkout"
}
```

### DELETE /api/feature-flags/:id

Hard-delete a feature flag.

---

## 25. Notifications

All routes require Bearer token with `superadmin` or `admin` role.

### GET /api/notifications

List notifications (ordered by `created_at` DESC).

### POST /api/notifications

Create a system-wide notification.

**Body:**

```json
{
  "title": "System Maintenance",
  "message": "The system will be down on Sunday 2 AM.",
  "target": "all",
  "plan_id": null,
  "sent_by": "admin-uuid"
}
```

`target`: `all`, `active`, `inactive`, `plan`

---

## 26. Audit Events

All routes require Bearer token with `superadmin` role.

### GET /api/audit-events

List audit events (paginated). Supports `?page=` and `?limit=` (max 50, default 50).

### GET /api/audit-events/:id

Get an audit event by ID.

---

## 27. Support Tickets (Admin)

All routes require Bearer token with `superadmin` or `admin` role.

### GET /api/support-tickets

List all support tickets.

### GET /api/support-tickets/:id

Get a ticket by ID.

### PUT /api/support-tickets/:id

Update ticket status.

**Body:**

```json
{ "status": "in_progress" }
```

Allowed values: `open`, `in_progress`, `resolved`, `closed`

---

## 28. Consumer Endpoints

### GET /me/orders

List current user's orders with restaurant name (JWT required).

**Auth:** Bearer token

### GET /me/notifications

List current user's notifications (JWT required, from `userNotifications` table).

**Auth:** Bearer token

### PUT /me/notifications/:id/read

Mark a notification as read.

**Auth:** Bearer token

### PUT /me/notifications/read-all

Mark all user notifications as read.

**Auth:** Bearer token

### POST /api/support-tickets (Consumer)

Create a support ticket (JWT required, scoped to current user).

**Body:**

```json
{
  "title": "Order issue",
  "message": "My order never arrived."
}
```

**Response `201`:** `{ "success": true, "id": "uuid" }`

### GET /api/support-tickets (Consumer — same route but scoped)

List current user's support tickets (ordered by `created_at` DESC).

**Auth:** Bearer token

---

## 29. Branch Settings

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

---

## 30. Commission Plans

All routes require Bearer token with `superadmin` role.

### GET /api/commission-plans

List commission plans. Auto-seeds defaults if empty.

### PUT /api/commission-plans/:id

Upsert a commission plan.

**Body (partial):**

```json
{
  "marketplace_fee": "8",
  "delivery_fee": "5",
  "payment_fee": "2.5",
  "additional_fees": [
    { "label": "Marketing", "percentage": 2 }
  ]
}
```

---

## 31. Admin Reports

All routes require Bearer token with `superadmin` role.

### GET /api/admin/reports/platform-metrics

Get platform-wide metrics.

**Response `200`:**

```json
{
  "totalOrders": 1234,
  "totalRevenue": 56789.0,
  "avgTicket": 45.99,
  "activeStores": 42,
  "deliveryPercent": 75,
  "takeoutPercent": 25
}
```

---

## 32. Loyalty

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

---

## 33. Coupon Validation Engine

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

---

## 34. Printing

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

---

## 35. Permissions

All routes require Bearer token with `superadmin` role.

### GET /api/permissions

List all permissions.

### GET /api/permissions/role/:role

List permissions assigned to a role.

### POST /api/permissions/assign

Assign a permission to a role.

**Body:**

```json
{
  "role": "merchant",
  "permissionId": "uuid"
}
```

### DELETE /api/permissions/revoke

Revoke a permission from a role.

**Body:**

```json
{
  "role": "merchant",
  "permissionId": "uuid"
}
```

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

## Authentication Notes

- Tokens are **JWT (HS256)** with claims: `sub` (user ID), `email`, `role`, `session_id`
- Sessions are tracked in the database; revoked or expired sessions return **401**
- Refresh tokens are opaque UUIDs stored server-side
- Rate limiting uses an in-memory store (or optional Redis) — headers not currently exposed

## Pagination Notes

Only `/api/audit-events` supports explicit pagination (`page`, `limit`). All other list endpoints return the full dataset.
