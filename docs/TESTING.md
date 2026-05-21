# Flux Delivery — Testing Guide

## Quick Reference

```bash
npm test                 # vitest interactive (watch mode)
npm run test:run         # vitest single-pass
npm run test:coverage    # vitest run --coverage (v8 provider)
```

## Test Architecture

### Dual Project Config (`vitest.config.ts`)

| Project  | Environment | Pattern                          | Setup        |
| -------- | ----------- | -------------------------------- | ------------ |
| `server` | `node`      | `server/src/**/*.test.ts`        | None         |
| `client` | `jsdom`     | `src/**/*.test.{ts,tsx}`         | `setup.ts`   |

### MSW (Mock Service Worker) — Frontend Only

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

## Writing Tests

### 1. Component Tests

Use `@testing-library/react` (`render`, `screen`, `waitFor`). Prefer `screen.getByText` / `getByTestId` over `container.querySelector`.

```typescript
// src/components/commerce/FxPriceTag.test.tsx
import { render, screen } from '@testing-library/react'
import { FxPriceTag } from './FxPriceTag'

describe('FxPriceTag', () => {
  it('renders price formatted as "R$ XX,XX"', () => {
    render(<FxPriceTag price={25.9} />)
    expect(screen.getByText('R$ 25,90')).toBeInTheDocument()
  })

  it.each(['sm', 'md', 'lg'] as const)('applies correct size class for %s', (size) => {
    render(<FxPriceTag price={10} size={size} />)
    const expected = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
    expect(screen.getByText('R$ 10,00')).toHaveClass(expected)
  })
})
```

#### Component Mocking Child Dependencies

```typescript
// src/components/commerce/FxDeliveryBadge.test.tsx
vi.mock('../ui/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="icon">{name}</span>,
}))

describe('FxDeliveryBadge', () => {
  it('renders both time and fee when both provided', () => {
    render(<FxDeliveryBadge time="30-40 min" fee={4.9} />)
    expect(screen.getByText('30-40 min')).toBeInTheDocument()
    expect(screen.getByText('R$ 4,90')).toBeInTheDocument()
  })
})
```

### 2. Hook Tests

Wrap hooks with a `QueryClientProvider`. Create a helper `createWrapper()` to avoid retries in tests.

```typescript
// src/hooks/useRestaurants.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../repositories/restaurantRepository', () => ({
  getRestaurants: vi.fn(),
  getRestaurantById: vi.fn(),
  getMenuItems: vi.fn(),
  getMenuItemById: vi.fn(),
  getCategories: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useRestaurants', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('calls getRestaurants and returns data', async () => {
    const mockData = [{ id: '1', name: 'Test Restaurant' }]
    vi.mocked(getRestaurants).mockResolvedValue(mockData as unknown as Restaurant[])

    const { result } = renderHook(() => useRestaurants(), { wrapper: createWrapper() })

    await waitFor(() => { expect(result.current.isSuccess).toBe(true) })
    expect(result.current.data).toEqual(mockData)
    expect(getRestaurants).toHaveBeenCalledTimes(1)
  })
})
```

### 3. Repository Tests

Mock the API layer and mappers. Test both the API call and the mapping.

```typescript
// src/repositories/restaurantRepository.test.ts
vi.mock('../api', () => ({
  restaurantApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getMenuItems: vi.fn(),
    getMenuItemById: vi.fn(),
    getCategories: vi.fn(),
  },
}))

vi.mock('../mappers/restaurantMapper', () => ({
  restaurantListDtoToModel: vi.fn((data: unknown) => data),
  restaurantDtoToModel: vi.fn((data: unknown) => data),
  menuItemListDtoToModel: vi.fn((data: unknown) => data),
  menuItemDtoToModel: vi.fn((data: unknown) => data),
  categoryDtoToModel: vi.fn((data: unknown) => data),
}))

describe('restaurantRepository', () => {
  it('getRestaurants calls restaurantApi.getAll() and maps the result', async () => {
    const mockDto = [{ id: '1', name: 'Test Restaurant' }]
    vi.mocked(restaurantApi.getAll).mockResolvedValue(mockDto as unknown as RestaurantDTO[])

    const result = await getRestaurants()

    expect(restaurantApi.getAll).toHaveBeenCalledTimes(1)
    expect(restaurantListDtoToModel).toHaveBeenCalledWith(mockDto)
    expect(result).toEqual(mockDto)
  })
})
```

### 4. Backend Route (Integration) Tests

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

### 5. Backend Pure Function Tests

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

### 6. MSW Handler Tests

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

## Test Structure Guidelines

### Mock Placement
- `vi.mock()` calls **must be hoisted** to the top of the file (Vitest auto-hoists them)
- Use `vi.hoisted()` for complex factory values that need to be referenced by both the mock and test code
- Use `vi.mocked()` for type-safe access to mocked function properties

### Async Patterns
- Always use `await waitFor(...)` for async React Query hooks
- Use `await waitFor(() => expect(result.current.isSuccess).toBe(true))` rather than arbitrary timeouts
- Route tests use `await import(...)` inside the test body for lazy route module loading
- Set timeout for heavy route tests: `it('...', async () => { ... }, 15000)`

### QueryClient Configuration
- Always create a new `QueryClient` per test with `{ defaultOptions: { queries: { retry: false } } }`
- Use a `createWrapper()` factory function to avoid duplication

### Reset Pattern
```typescript
beforeEach(() => {
  vi.clearAllMocks()
  resetDbMocks() // backend-specific: restore mock chain defaults
})
```

## Scenarios (MSW Testing)

Toggle mock behavior for edge cases and error states:

| Scenario             | Effect                                |
| ------------------- | ------------------------------------- |
| `default`           | Normal mock responses                 |
| `empty_store`       | Empty arrays for list endpoints       |
| `kitchen_congested` | All orders show `status: 'pending'`  |
| `payment_declined`  | Loyalty redeem returns 402            |
| `courier_offline`   | Operations status returns `isOpen: false` |
| `tenant_expired`    | Subscriptions show `billing_status: 'cancelled'` |
| `merchant_blocked`  | Companies show `plan: 'blocked'`, orders return 403 |

```typescript
import { setScenario } from '../../mocks/scenarios'

it('handles blocked merchant', () => {
  setScenario('merchant_blocked')
  // ... test behavior
})
```

## Coverage

- **Provider**: v8 (built into Node.js)
- **Reporters**: `text` (console), `html` (browser report), `lcov` (CI integration)
- Run: `npm run test:coverage`
- Output: `coverage/` directory

No minimum coverage threshold is configured — teams should define their own targets per module.

## File Organization

```
src/
  components/commerce/FxPriceTag.test.tsx    # co-located with component
  hooks/useRestaurants.test.tsx              # co-located with hook
  repositories/restaurantRepository.test.ts  # co-located with repository
  mocks/handlers/__tests__/handlers.test.ts  # __tests__ directory pattern

server/src/
  routes/routes.test.ts                      # co-located with route
  lib/errors.test.ts                         # co-located with module
  services/operations/index.test.ts          # co-located with service
  services/printing/__tests__/kitchen-auto-print.test.ts  # __tests__ directory
```

Both `MyModule.test.ts` (co-located) and `__tests__/MyModule.test.ts` (directory) patterns are acceptable.

## Common Patterns Reference

| Pattern | When to Use |
|---------|------------|
| `render(<Component />)` + `screen.getByText()` | Presentational components |
| `vi.mock('./dependency')` | Isolating the unit under test |
| `vi.mocked(fn).mockResolvedValue(...)` | Stubbing async dependencies |
| `renderHook(() => useHook(), { wrapper })` | React Query hooks |
| `await waitFor(() => expect(...))` | Async assertions |
| `new Hono().route('/api/...', route).request(...)` | Backend route integration |
| `vi.hoisted(() => { ... })` | Values needed before `vi.mock` runs |
| `fetch('http://localhost/api/...')` | MSW handler testing |
| `setScenario('...')` | Testing error/edge case states via MSW |
| `it.each([...])('... %s', (value) => { ... })` | Parameterized component tests |

## Excluded from Build

All test files are excluded from the production build via `tsconfig.app.json`:

```json
"exclude": [
  "src/test",
  "**/*.test.ts",
  "**/*.test.tsx"
]
```
