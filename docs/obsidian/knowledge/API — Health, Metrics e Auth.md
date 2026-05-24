---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/api
---

# API — Health, Metrics e Auth

**Base URL:** `http://localhost:3001/api`
**Auth Header:** `Authorization: Bearer <token>`

## Health & Metrics

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

## Auth

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

## Authentication Notes

- Tokens are **JWT (HS256)** with claims: `sub` (user ID), `email`, `role`, `session_id`
- Sessions are tracked in the database; revoked or expired sessions return **401**
- Refresh tokens are opaque UUIDs stored server-side
- Rate limiting uses an in-memory store (or optional Redis)

> [!tip] Navegação
> [[API]] · [[Authentication Flow]] · [[Rotas da API]]
