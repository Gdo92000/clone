---
type: pattern
status: active
domain: wiki
layer: L3
created_at: 2026-05-31
updated_at: 2026-05-31
tags:
  - frontend
  - arquitetura
  - componentes
  - estado
---

# Frontend Patterns

## Problema

Aplicações frontend crescendo sem estrutura definida viram monolítos de componentes acoplados, estado espalhado e lógica duplicada. Falta de separação clara entre camadas dificulta manutenção, teste e escalabilidade.

## Solução

Arquitetura baseada em camadas com responsabilidades bem definidas: **apresentação**, **lógica de negócio**, **acesso a dados** e **estado global**. Componentes são organizados em árvore com fluxo de dados unidirecional.

### Organização de diretórios

```
src/
  components/       # Componentes reutilizáveis (presentacionais)
  features/         # Módulos por funcionalidade (composição)
  hooks/            # Custom hooks compartilhados
  services/         # API, cache, armazenamento
  stores/           # Estado global (Zustand, Context)
  utils/            # Funções puras auxiliares
```

### Composição sobre configuração

```tsx
// ❌ Evitar: props booleanas que controlam layout internamente
<Card variant="elevated" showHeader showFooter border rounded={false} />

// ✅ Preferir: composição explícita
<Card.Root>
  <Card.Header>
    <Card.Title>Pedido #123</Card.Title>
  </Card.Header>
  <Card.Body>
    <OrderSummary order={order} />
  </Card.Body>
  <Card.Footer>
    <Button onClick={handleConfirm}>Confirmar</Button>
  </Card.Footer>
</Card.Root>
```

### Separação estado x UI

```tsx
// hooks/useOrders.ts — lógica de estado
function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const load = useCallback(async () => {
    const data = await api.getOrders()
    setOrders(data)
  }, [])
  return { orders, load }
}

// components/OrderList.tsx — apenas renderização
function OrderList({ orders, onSelect }: OrderListProps) {
  return orders.map(order => (
    <OrderRow key={order.id} order={order} onSelect={onSelect} />
  ))
}
```

## Trade-offs

- **Mais arquivos**: a separação por camadas aumenta a quantidade de arquivos, mas cada um tem responsabilidade única.
- **Curva de aprendizado**: novos devs precisam entender a estrutura antes de contribuir.
- **Overhead inicial**: projetos pequenos podem achar a estrutura pesada; adote progressivamente.
- **Composição verbosa**: componentes compostos exigem mais JSX, mas oferecem flexibilidade real.

## Fontes

- [Patterns.dev — Component Composition](https://www.patterns.dev/react/component-composition/)
- [React Docs — Thinking in React](https://react.dev/learn/thinking-in-react)
