---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/auth
- domain/architecture
---

# Authentication Flow

## JWT Authentication (HS256)

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Client │ │ Server │ │ DB │
├──────────┤ ├──────────┤ ├──────────┤
│ POST │─────────►│ │ │ │
│ /api/auth│ {email │ provider│ │ │
│ /login │ ,pass} │ .login() │─────────►│ users │
│ │ │ │ verify │ │
│ │ │ bcrypt │◄─────────┤ │
│ │ │ │ │ │
│ │◄─────────┤ generate │ │ │
│ {user, │ JWT + │ session │─────────►│auth_ │
│ token, │ refresh │ insert │ │sessions │
│ refresh}│ │ │ │ │
└──────────┘ └──────────┘ └──────────┘
```

## Login Flow

1. `POST /api/auth/login` with email + password
2. Rate limited (10 req/60s)
3. Schema validated via Zod
4. Auth provider (`local` or `supabase` — supabase is only typed, not implemented) handles password verification (bcryptjs)
5. On success: generates JWT access token + refresh token, creates session record in `authSessions`
6. Returns `{ user, token, refreshToken, expiresIn }`

## Token Refresh

1. Client detects 401 response
2. `httpClient` calls `POST /api/auth/refresh` with refresh token
3. Server verifies refresh token, issues new access token
4. On failure: clears auth, redirects to login

## Session Validation (authMiddleware)

1. Decodes JWT via `hono/jwt` with HS256 secret
2. Extracts `session_id` from payload
3. Queries `authSessions` table — checks `revoked_at IS NULL` and `expires_at > NOW()`
4. Returns 401 if session revoked or expired

## Logout

Revokes session in `authSessions` table.

## Auth Provider Interface

`AuthProvider` (`server/src/auth/types.ts`): interface with `login`, `register`, `logout`, `refresh`, `hashPassword`, `verifyPassword`, `generateTokens`, `verifyToken`, `verifyRefreshToken`, `getCurrentUser`, `middleware`.

**Current provider**: `local` (implemented in `server/src/auth/local/provider.ts`).

## Frontend Authentication

- `authService` manages token storage (localStorage with `fluxds-` prefix)
- `initAuthSync` listens for cross-tab logout events
- `authApi` wraps HTTP calls to `/api/auth/*`
- `useAuthSession` hook provides `currentUser`, `hasRole`, `hasPermission`
- `ProtectedRoute` component renders children only if authenticated, shows login link otherwise
- Role/permission check: `ProtectedRoute` with `roles` or `permission` props

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[ARCHITECTURE]] · [[Estrutura do Backend]]
