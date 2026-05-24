---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/testing
---

# Testes — Estrutura e Padrões

## Framework
```
Vitest v4 — dual project
  server   → environment: node
  frontend → environment: jsdom, setupFiles: src/test/setup.ts
```

## Projetos no vitest.config.ts
```
server (node):
  include: server/src/**/*.test.ts
  globals: true

frontend (jsdom):
  include: src/**/*.test.{ts,tsx}
  setupFiles: src/test/setup.ts
  css: true
  globals: true
```

## MSW — Mock Service Worker v2
```
src/test/setup.ts        → server.listen({ onUnhandledRequest: 'bypass' })
public/mockServiceWorker.js → worker
src/mocks/handlers/      → cenários: default, empty_store, kitchen_congested, merchant_blocked, payment_declined, tenant_expired, courier_offline
__USE_MOCK__ flag      → sempre false em produção; usado só p/ retrocompat
```

## Tipos de teste

### Server (vitest node)
```
server/src/routes/routes.test.ts        → testes de rotas completas (14 testes)
server/src/__tests__/contract/          → endpoint-parity (23 testes)
server/src/__tests__/fixtures/          → serializer + load-fixture (18 testes)
server/src/services/.../*.test.ts       → testes de serviços isolados
server/src/lib/*.test.ts                → testes de módulos utilitários
```

### Frontend (vitest jsdom)
```
src/**/*.test.tsx                        → componentes e hooks
src/mocks/handlers/__tests__/            → handlers.msc mock scenarios (24 testes)
```

## Count atual (FASE 18)
```
172 testes passando (13 suítes)
0 falhas
```

## Padrões adotados
- `beforeEach`: initRandom(42) + createMemoryRegistry() limpa stores entre testes
- `afterAll`: clearAllMemoryStores() — singleton de registry limpo para próximo processo
- Snapshot isolado por suíte — não compartilhado entre suítes
- MSW handlers trocados antes de cada grupo relevante

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[MOC — Guias de Desenvolvimento]]
