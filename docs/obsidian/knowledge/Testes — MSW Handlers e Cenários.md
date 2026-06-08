---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-06-06
tags:
- type/knowledge
- domain/testing
- domain/mocking
---

# Testes - MSW Handlers e Cenários

## MSW Setup (Frontend Only)

- **Setup**: src/test/setup.ts inicia MSW antes de todos os tests com onUnhandledRequest: 'error'
- **Server**: src/mocks/server.ts - setupServer(...handlers) from msw/node
- **Handlers**: src/mocks/handlers/index.ts combina auth, restaurants, merchant, subscriptions, superadmin, operations, coverage, printing, customer e cities
- **Fixtures**: src/mocks/fixtures/ - arrays tipados com dados mock
- **Scenarios**: src/mocks/scenarios/ - altera comportamento de mock via setScenario('empty_store')
- **Browser worker**: public/mockServiceWorker.js (MSW v2)

`	ypescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { server } from '../mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
`

## MSW Handler Tests

Testa handlers diretamente via etch contra http://localhost. Usa setScenario para verificar comportamento por cenário.

`	ypescript
// src/mocks/handlers/__tests__/handlers.test.ts
import { server } from '../../server'
import { setScenario } from '../../scenarios/index'

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
`

## Cenários

Toggle de comportamento para edge cases e estados de erro:

| Cenário | Efeito |
|----------|--------|
| default | Respostas mock normais |
| empty_store | Arrays vazios para endpoints de lista |
| kitchen_congested | Todos orders com status: 'preparing' |
| payment_declined | Loyalty redeem retorna 402 |
| courier_offline | Operations status retorna isOpen: false |
| 	enant_expired | Subscriptions com illing_status: 'cancelled' |
| merchant_blocked | Companies com plan: 'blocked', orders retornam 403 |

`	ypescript
import { setScenario } from '../../mocks/scenarios/index'

it('handles blocked merchant', () => {
  setScenario('merchant_blocked')
  // ... test behavior
})
`

## Fase 30 - Cleanup

- Removido: VITE_MOCK_RESTAURANTS, VITE_MOCK_ORDERS, VITE_MOCK_GEOCODING (env vars mortas).
- Removido: __MOCK_RESTAURANTS__, __MOCK_ORDERS__ (defines).
- isMockRestaurants() / isMockOrders() agora retornam alse hardcoded (gate do provider layer paralelo).
- Mantido: MSW inteiro (test + dev PC) — ver [[MSW - Mock Service Worker]].

> [!tip] Padrões Relacionados
> [[Testes - Configuração e Padrões]] - [[Testes - Frontend Components e Hooks]] - [[MSW - Mock Service Worker]] - [[ADR-004 DB Seed como Single Source of Truth]]