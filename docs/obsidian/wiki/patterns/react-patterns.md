---
type: pattern
status: active
domain: wiki
layer: L3
created_at: 2026-05-31
updated_at: 2026-05-31
tags:
  - react
  - server-components
  - hooks
  - performance
---

# React Patterns

## Problema

React 19 introduziu Server Components, Actions e novos hooks. Sem padrões claros, times misturam responsabilidades entre servidor e cliente, criam waterfalls de requisições e perdem benefícios de performance.

## Solução

### Server Components como padrão

Componentes são Server Components por padrão no Next.js App Router. Reserve `"use client"` apenas quando precisar de estado, efeitos ou interatividade.

```tsx
// app/products/page.tsx — Server Component (padrão)
export default async function ProductsPage() {
  const products = await db.product.findMany()

  return (
    <div>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
      <ClientFilters /> {/* "use client" só aqui */}
    </div>
  )
}
```

### Custom hooks com useOptimistic (React 19)

```tsx
function useFavorite(productId: string) {
  const [optimisticFav, addOptimistic] = useOptimistic(
    false,
    (_, newVal: boolean) => newVal
  )

  const toggle = async () => {
    addOptimistic(!optimisticFav)
    await api.toggleFavorite(productId)
  }

  return { isFavorite: optimisticFav, toggle }
}
```

### Performance: memoização seletiva

```tsx
import { memo, useMemo, useCallback } from 'react'

const ExpensiveList = memo(function ExpensiveList({
  items,
  onSelect,
}: {
  items: Item[]
  onSelect: (id: string) => void
}) {
  return items.map(item => <ItemRow key={item.id} item={item} />)
})

function Parent() {
  const items = useMemo(() => computeItems(data), [data])
  const onSelect = useCallback((id: string) => setSelected(id), [])

  return <ExpensiveList items={items} onSelect={onSelect} />
}
```

### Server Actions para mutações

```tsx
"use server"

export async function createOrder(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = orderSchema.parse(raw)
  await db.order.create({ data: parsed })
  revalidatePath('/orders')
}
```

## Trade-offs

- **Server Components**: não podem usar hooks, eventos ou estado; exigem mentalidade diferente.
- **`"use client"**  boundary**: uma vez marcado, todos os filhos são client-side; suba o ponto de entrada ao mínimo necessário.
- **useOptimistic**: a UI assume sucesso antes da resposta — precisa de fallback em caso de erro.
- **memo/useCallback**: usar sem necessidade real adiciona custo de comparação; meça antes de otimizar.

## Fontes

- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [Next.js — Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
