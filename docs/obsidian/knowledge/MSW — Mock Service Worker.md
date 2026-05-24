---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/testing
---

# MSW — Mock Service Worker (Frontend)

## Configuração
```
src/test/setup.ts         → server.listen({ onUnhandledRequest: 'bypass' })
public/mockServiceWorker.js → worker do navegador
vitest.config.ts          → setupFiles: ['src/test/setup.ts'] no projeto frontend
```

## Cenários disponíveis (7 modos)

| Cenário | Efeito |
|---|---|
| `default` | Dados padrão — comportamento normal |
| `empty_store` | Sem pedidos — UX de vazio |
| `kitchen_congested` | Todos pedidos ficam `preparing` — mesa cheia |
| `merchant_blocked` | Bloqueia troca de status com 403 |
| `payment_declined` | Rejeita resgate de fidelidade com 402 |
| `tenant_expired` | Mostra assinaturas canceladas |
| `courier_offline` | `isOpen = false` — estabelecimentos fechados |

## Uso nos testes
```typescript
import { setupServer } from 'msw/node';
import { handlers } from '../src/mocks/handlers';

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: '__proto__' }));
afterAll(() => server.close());
```

## Como adicionar um novo cenário
1. Adicionar `scenarioValues` / `rotateScenario()` em `src/mocks/handlers/scenarioContext.ts`
2. Criar `newScenario.ts` que exporta novo array de `HttpHandler`
3. Importar em `src/mocks/handlers/index.ts`

## Flows verificados
```
Auth          → login / me / token refresh
Restaurant    → list / detail / menu filter
Merchant      → companies / orders / campaigns / coupons
Operations    → open-status / holidays
Coverage      → coverage-cities com created_at
Subscription  → subscription-addons toggle
Printing      → printer-config / print-history
Scenario → todos os 7 cenários validados (24 testes)
```

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[MOC — Guias de Desenvolvimento]]
