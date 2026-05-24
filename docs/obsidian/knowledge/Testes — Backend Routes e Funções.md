---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/testing
- profile/merchant
- profile/admin
---

# Testes — Backend Routes e Funções

## Route Integration Tests

Instantiate a `Hono` app with the route, then use `app.request()` to simulate HTTP calls. Mock the database with `vi.hoisted` mocks.

```typescript
// server/src/routes/routes.test.ts
import { Hono } from 'hono'

const { selectMock, insertMock, updateMock, deleteMock } = vi.hoisted(() => {
  const select = vi.fn()
  const insert = vi.fn()
  const update = vi.fn()
  const del = vi.fn()
  return { selectMock: select, insertMock: insert, updateMock: update, deleteMock: del }
})

vi.mock('../db', () => ({
  db: {
    select: selectMock.mockReturnValue(mockChain([])),
    insert: insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    update: updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
    delete: deleteMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  },
}))

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c, next) => { await next() }) as MiddlewareHandler,
  getTokenPayload: () => ({ sub: 'admin-1', email: 'admin@test.com', role: 'superadmin' }),
}))

const mockSelect = (result: unknown[]) => ({
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  then: vi.fn((cb) => Promise.resolve(cb(result))),
})

describe('Plans', () => {
  it('GET / returns plans from DB', async () => {
    selectMock.mockImplementation(() => mockSelect([{ id: 'basic', name: 'Básico' }]))
    const { default: route } = await import('./plans')
    const app = new Hono().route('/api/plans', route)
    const res = await app.request('/api/plans')
    const body = await res.json() as Record<string, unknown>[]
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe('basic')
  })
})
```

## Pure Function Tests

No mocking needed. Import and test directly.

```typescript
// server/src/lib/errors.test.ts
import { AppError, notFound, badRequest, conflict, unauthorized, errorHandler } from './errors'

describe('AppError', () => {
  it('sets statusCode and message from constructor', () => {
    const err = new AppError(400, 'bad request')
    expect(err.statusCode).toBe(400)
    expect(err.message).toBe('bad request')
  })
})
```

> [!tip] Padrões Relacionados
> [[Testes — Configuração e Padrões]] · [[Estrutura do Backend]] · [[Middlewares e Segurança]]
