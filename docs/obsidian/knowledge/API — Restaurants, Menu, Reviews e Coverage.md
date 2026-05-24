---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/api
- profile/consumer
---

# API — Restaurants, Menu, Reviews e Coverage

## Restaurants

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

## Categories

### GET /api/categories

List all categories (sorted by name).

**Auth:** None

**Response `200`:** Array of category objects.

## Menu Items

### GET /api/menu-items

List all menu items.

**Auth:** None

**Response `200`:** Array of menu item objects.

### GET /api/menu-items/:id

Get a menu item by ID.

**Auth:** None

**Response `200`:** Menu item object.

**Response `404`:** `{ "error": "Not found" }`

## Coverage Cities

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

## Reviews

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

## Theme

### GET /api/theme/me/theme

Get theme config for the resolved company domain.

**Auth:** None (resolved via domain middleware)

**Response `200`:**

```json
{ "theme": "default" }
```

> [!tip] Navegação
> [[API]] · [[API — Commerce, Coupons e Loyalty]] · [[MOC — Perfis do Sistema]]
