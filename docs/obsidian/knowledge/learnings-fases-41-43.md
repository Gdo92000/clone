---
type: knowledge
status: active
domain: domain/core
layer: layer/L2
created_at: 2026-06-09
updated_at: 2026-06-09
related:
  - server/src/routes/orders.ts
  - src/pages/TrackingPage.tsx
  - shared/orders/orderStateMachine.ts
  - src/types/order.ts
  - server/src/routes/merchant-analytics.ts
  - server/src/routes/merchant-finance.ts
tags:
  - type/knowledge
  - domain/core
  - tech/patterns
  - tech/orders
  - tech/architecture
aliases:
  - Learnings Fases 41-43
  - Fluxo de Pedidos
  - Analytics
  - Enterprise Removal
---

# Learnings — Fases 41-43

## Fluxo Condicional Delivery/Pickup (Fase 43)

### Problema
O sistema precisava diferenciar entre pedidos delivery e pickup, mas a state machine permitia `ready→dispatched→delivered` para todos os pedidos. Pickup nao tem etapa de entrega — o cliente retira no balcao.

### Solucao
**Transicoes condicionais no backend** (`server/src/routes/orders.ts:83-91`):
```ts
ready: isPickup ? ['delivered'] : ['dispatched'],
```

**Frontend replica a logica** (`MerchantOrdersPage.tsx:10-24`):
```ts
const NEXT_STATUS_MAP: Record<'delivery' | 'pickup', ...> = {
  delivery: { ..., ready: 'dispatched', dispatched: 'delivered' },
  pickup:   { ..., ready: 'delivered' },
};
```

### Aprendizado
- A `delivery_type` precisa estar disponivel no SELECT inicial do backend — nao pode vir de join separado.
- O frontend DEVE replicar a logica de transitions para saber qual botao mostrar (`getNextStatus`).
- `MERCHANT_TO_CUSTOMER_STATUS` mapeia enums diferentes entre `merchantOrders` e `orders` na mesma transacao.
- SSE precisa publicar em AMBOS os topicos (`branch:` para merchant, `user:` para cliente).

## TrackingPage sem "Saiu para entrega" para Pickup

### Problema inicial
`getStatusSteps()` retornava sempre 5 steps, incluindo `dispatched` ("Saiu para entrega"). Para pickup, esse step ficava cinza (nunca completado) mas ainda visivel.

### Solucao
`getStatusSteps(deliveryType)` retorna 4 steps para pickup, 5 para delivery:
```ts
const steps = [
  { status: 'confirmed', label: 'Pedido confirmado' },
  { status: 'preparing', label: 'Preparando seu pedido' },
  { status: 'ready', label: deliveryType === 'pickup' ? 'Pronto para retirada' : 'Pedido pronto' },
  { status: 'delivered', label: 'Entregue' },
];
if (deliveryType !== 'pickup') {
  steps.splice(3, 0, { status: 'dispatched', label: 'Saiu para entrega' });
}
```

### Aprendizado
- `FxOrderStatus` renderiza APENAS os steps que recebe — se `dispatched` nao esta no array, nao aparece.
- `splice()` e mais limpo que filter para insercao condicional no meio do array.
- Testes precisam validar BOTH comprimento E ausencia de status speficico.

## Push Notifications com Mensagens Distintas

### Estrutura
```ts
const statusMessages = {
  delivery: { ready: 'Seu pedido esta pronto!', dispatched: '...', delivered: '...' },
  pickup:   { ready: 'Seu pedido esta pronto para retirada!', delivered: 'Pedido retirado. Obrigado!' },
};
```

Pickup NAO tem chave `dispatched` — se o status for `dispatched` para pickup, a condicao `if (message)` impede o envio.

## Remocao do Modulo Enterprise (Fase 42)

### Criterios para delecao segura
1. Paginas nao roteadas em nenhum lugar (verificar `App.tsx` e `routes.ts`)
2. Repositorios sem consumidor (verificar injecao de dependencia)
3. Servicos sem chamada
4. Dados mock duplicados em outras fontes
5. Backend inexistente para o recurso

### Preservado
- `usePlanLimits` — usado por modulos reais (merchant, admin)
- `useAuditLog` — usado por modulos reais
- `auditApi` — endpoint `GET /audit` existe no backend

## Analytics e Financeiro (Fase 41)

### Componentizacao de Graficos
- `FxPieChart` usa `fill` diretamente no `<Pie>` (recharts v3+) — evita `<Cell>` e warning de `unique key`.
- `FxLineChart` e `FxBarChart` sao wrappers thin sobre recharts com theming via tokens.
- DTOs (`analyticsDto.ts`) desacoplam formato da API do formato do grafico.

### MSW para Analytics
- Handlers em `src/mocks/handlers/analytics.ts` com fixtures em `src/mocks/fixtures/analytics.ts`.
- Cenario `default` retorna dados reais; cenarios alternativos (ex: `empty_store`) retornam arrays vazios.
