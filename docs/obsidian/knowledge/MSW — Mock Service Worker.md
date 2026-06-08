---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-06-06
tags:
  - type/knowledge
  - domain/testing
---

# MSW - Mock Service Worker (Frontend)

## Configuração
`
src/test/setup.ts         -> server.listen({ onUnhandledRequest: 'error' })
public/mockServiceWorker.js -> worker do navegador (MSW v2)
vitest.config.ts          -> setupFiles: ['src/test/setup.ts'] no projeto frontend
`

## Status (Fase 30)

MSW permanece como infraestrutura de testes (Vitest intercepta fetch via setupServer)
e em dev no PC (Service Worker + cert confiável). Em mobile/LAN, MSW não ativa
(cert mkcert não confiável no celular) — backend real via Postgres é a fonte
canônica (ver [[ADR-004 DB Seed como Single Source of Truth]]).

## Cenários disponíveis (7 modos)

| Cenário | Efeito |
|---|---|
| default | Dados padrão - comportamento normal |
| empty_store | Sem pedidos - UX de vazio |
| kitchen_congested | Todos pedidos ficam preparing - mesa cheia |
| merchant_blocked | Bloqueia troca de status com 403 |
| payment_declined | Rejeita resgate de fidelidade com 402 |
| 	enant_expired | Mostra assinaturas canceladas |
| courier_offline | isOpen = false - estabelecimentos fechados |

## Uso nos testes
`	ypescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { server } from '../mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
`

`	ypescript
// src/mocks/handlers/__tests__/handlers.test.ts
import { server } from '../../server';
import { setScenario } from '../../scenarios/index';

beforeEach(() => setScenario('default'));
afterEach(() => server.resetHandlers());
`

## Como adicionar um novo cenário
1. Adicionar nome em src/mocks/scenarios/types.ts (union de ScenarioName).
2. Implementar override em src/mocks/handlers/<dominio>.ts lendo getCurrentScenario().
3. Cobrir em src/mocks/handlers/__tests__/handlers.test.ts com setScenario('novo').

## Runtime Dev: toggle manual de cenário

No console do navegador (PC dev):
`javascript
window.__MSW_SCENARIO = "kitchen_congested"
`

## Flows verificados
`
Auth          -> login / me / token refresh
Restaurant    -> list / detail / menu filter
Merchant      -> companies / orders / campaigns / coupons
Operations    -> open-status / holidays
Coverage      -> coverage-cities com created_at
Subscription  -> subscription-addons toggle
Printing      -> printer-config / print-history
Scenario      -> todos os 7 cenários validados (24 testes)
`

> [!tip] Navegação
> [[MOC - Arquitetura do Sistema]] - [[MOC - Guias de Desenvolvimento]] - [[ADR-004 DB Seed como Single Source of Truth]]