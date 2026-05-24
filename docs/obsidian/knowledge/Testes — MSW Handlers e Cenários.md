---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/testing
- domain/mocking
---

# Testes — MSW Handlers e Cenários

## MSW Setup (Frontend Only)

- **Setup**: `src/test/setup.ts` starts MSW before all tests with `onUnhandledRequest: 'bypass'`
- **Server**: `src/mocks/server.ts` — `setupServer(...handlers)` from `msw/node`
- **Handlers**: `src/mocks/handlers/index.ts` combines auth, restaurants, merchant, subscriptions, superadmin, operations, coverage, printing, proxy, and other handlers
- **Fixtures**: `src/mocks/fixtures/` — factory functions with typed mock data
- **Scenarios**: `src/mocks/scenarios/` — toggle mock behavior via `setScenario('empty_store')`
- **Browser worker**: `public/mockServiceWorker.js` (MSW v2.14.6)

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { server } from '../mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## MSW Handler Tests

Test mock handlers directly via `fetch` against `http://localhost`. Use `setScenario` to verify scenario-specific behavior.

```typescript
// src/mocks/handlers/__tests__/handlers.test.ts
import { server } from '../../server'
import { setScenario } from '../../scenarios'

beforeEach(() => setScenario('default'))
afterEach(() => server.resetHandlers())

describe('Auth', () => {
  it('POST /api/auth/login returns 200 with token', async () => {
    const res = await fetch('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@admin.com', password: 'admin' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { token: string }
    expect(body.token).toBe('mock-jwt-token-superadmin')
  })

  it('GET /api/auth/me returns 401 without token', async () => {
    const res = await fetch('http://localhost/api/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('Scenario behavior', () => {
  it('empty_store scenario returns no orders', async () => {
    setScenario('empty_store')
    const res = await fetch('http://localhost/api/orders')
    expect(res.status).toBe(200)
    const body = await res.json() as unknown[]
    expect(body).toEqual([])
  })
})
```

## Scenarios

Toggle mock behavior for edge cases and error states:

| Scenario | Effect |
|----------|--------|
| `default` | Normal mock responses |
| `empty_store` | Empty arrays for list endpoints |
| `kitchen_congested` | All orders show `status: 'pending'` |
| `payment_declined` | Loyalty redeem returns 402 |
| `courier_offline` | Operations status returns `isOpen: false` |
| `tenant_expired` | Subscriptions show `billing_status: 'cancelled'` |
| `merchant_blocked` | Companies show `plan: 'blocked'`, orders return 403 |

```typescript
import { setScenario } from '../../mocks/scenarios'

it('handles blocked merchant', () => {
  setScenario('merchant_blocked')
  // ... test behavior
})
```

> [!tip] Padrões Relacionados
> [[Testes — Configuração e Padrões]] · [[Testes — Frontend Components e Hooks]] · [[MSW — Mock Service Worker]]
