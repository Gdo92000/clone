---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/api
- profile/admin
- profile/superadmin
---

# API — SaaS, Admin, Permissions e Consumer

## Plans

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

## Capabilities

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

## Subscriptions

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

## Subscription Addons

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

## Invoices

All routes require Bearer token with `superadmin` or `admin` role.

### GET /api/invoices

List all invoices.

### GET /api/invoices/:id

Get invoices by company ID.

## Addons

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

## Feature Flags

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

## Commission Plans

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

## Admin Users

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

## Admin Reports

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

## Notifications

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

## Audit Events

All routes require Bearer token with `superadmin` role.

### GET /api/audit-events

List audit events (paginated). Supports `?page=` and `?limit=` (max 50, default 50).

### GET /api/audit-events/:id

Get an audit event by ID.

## Support Tickets (Admin)

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

## Permissions

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

## Consumer Endpoints

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

## Pagination Notes

Only `/api/audit-events` supports explicit pagination (`page`, `limit`). All other list endpoints return the full dataset.

> [!tip] Navegação
> [[API]] · [[SaaS Capability System]] · [[API — Merchant, Operations e Branches]]
