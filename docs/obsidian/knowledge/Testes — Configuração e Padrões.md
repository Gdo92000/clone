---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/testing
---

# Testes — Configuração e Padrões

## Quick Reference

```bash
npm test                # vitest interactive (watch mode)
npm run test:run        # vitest single-pass
npm run test:coverage   # vitest run --coverage (v8 provider)
```

## Dual Project Config (`vitest.config.ts`)

| Project | Environment | Pattern | Setup |
|---------|-------------|---------|-------|
| `server` | `node` | `server/src/**/*.test.ts` | None |
| `client` | `jsdom` | `src/**/*.test.{ts,tsx}` | `setup.ts` |

## Mock Placement

- `vi.mock()` calls **must be hoisted** to the top of the file (Vitest auto-hoists them)
- Use `vi.hoisted()` for complex factory values that need to be referenced by both the mock and test code
- Use `vi.mocked()` for type-safe access to mocked function properties

## Async Patterns

- Always use `await waitFor(...)` for async React Query hooks
- Use `await waitFor(() => expect(result.current.isSuccess).toBe(true))` rather than arbitrary timeouts
- Route tests use `await import(...)` inside the test body for lazy route module loading
- Set timeout for heavy route tests: `it('...', async () => { ... }, 15000)`

## QueryClient Configuration

- Always create a new `QueryClient` per test with `{ defaultOptions: { queries: { retry: false } } }`
- Use a `createWrapper()` factory function to avoid duplication

## Reset Pattern

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  resetDbMocks() // backend-specific: restore mock chain defaults
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
  components/commerce/FxPriceTag.test.tsx      # co-located with component
  hooks/useRestaurants.test.tsx                 # co-located with hook
  repositories/restaurantRepository.test.ts     # co-located with repository
  mocks/handlers/__tests__/handlers.test.ts     # __tests__ directory pattern

server/src/
  routes/routes.test.ts                         # co-located with route
  lib/errors.test.ts                            # co-located with module
  services/operations/index.test.ts             # co-located with service
  services/printing/__tests__/kitchen-auto-print.test.ts  # __tests__ directory
```

Both `MyModule.test.ts` (co-located) and `__tests__/MyModule.test.ts` (directory) patterns are acceptable.

## Common Patterns Reference

| Pattern | When to Use |
|---------|-------------|
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

> [!tip] Padrões Relacionados
> [[Testes — Frontend Components e Hooks]] · [[Testes — Backend Routes e Funções]] · [[Testes — MSW Handlers e Cenários]] · [[DEVELOPMENT]]
