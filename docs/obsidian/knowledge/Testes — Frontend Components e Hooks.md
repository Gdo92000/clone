---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
- type/knowledge
- domain/testing
- profile/consumer
---

# Testes — Frontend Components e Hooks

## Component Tests

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

### Component Mocking Child Dependencies

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

## Hook Tests

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

## Repository Tests

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

> [!tip] Padrões Relacionados
> [[Testes — Configuração e Padrões]] · [[Testes — MSW Handlers e Cenários]] · [[Frontend — Estrutura e Padrões]]
