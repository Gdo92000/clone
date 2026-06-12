---
title: ADR-007 Test Pattern
type: adr
status: approved
created_at: 2026-06-12
updated_at: 2026-06-12
tags:
  - type/adr
  - domain/testing
  - tech/vitest
  - tech/msw
supersedes: null
related:
  - ADR Index.md
  - MEMORY.md
  - Testes — Estrutura e Padrões
  - Testes — Configuração e Padrões
---

# ADR-007: Test Pattern

## Status

✅ Aprovado em 2026-06-12 (pós-LOOP 4 — consolidado dos LOOPs 3-4)

## Contexto

O projeto atingiu 87 server test files, 650 testes server, 851 testes full suite. Durante a expansão (LOOP 3) e refatoração arquitetural (LOOP 4), padrões de teste emergiram que precisam ser formalizados para garantir consistência futura.

## Decisões

### 1. Dual Project Config (Vitest)

```typescript
// vitest.config.ts
export default defineConfig({
  projects: [
    {
      name: 'server',
      test: { environment: 'node', include: ['server/src/**/*.test.ts'] }
    },
    {
      name: 'frontend',
      test: { environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] }
    }
  ]
});
```

- Server tests rodam em Node environment
- Frontend tests rodam em jsdom
- Projetos isolados evitam contaminação de ambiente

### 2. MSW para Mock de API (Frontend)

- MSW intercepta chamadas HTTP no nível do service worker
- Setup em `src/test/setup.ts` — `server.listen()` antes de todos os testes
- `onUnhandledRequest: 'bypass'` — não falha em requests não mockados
- Handlers por domínio em `src/test/handlers/`

### 3. `mockedDb` Pattern (Backend — Drizzle Mock)

```typescript
const mockedDb = vi.mocked(db);
mockedDb.select.mockReturnValue(...);
```

- **NÃO** fazer `vi.mocked(db.select)` — separa método de `this`, causa `unbound-method`
- Mockar `db` inteiro uma vez, acessar métodos do mock

### 4. Middleware Mock Typing

```typescript
mockAuthMiddleware.mockImplementation(
  async (_c, next: () => Promise<void>) => { ... }
);
```

- `next` deve ser tipado como `() => Promise<void>`
- Sem tipo, `next` vira `Function` e dispara `no-unsafe-call`

### 5. Fixture-Based Testing

- Fixtures carregadas via `loadFixtures(registry)` no `beforeEach`
- `registry.reset()` no `afterEach` para isolar estado entre testes
- Snapshots de registry via `registry-shots.ts`

### 6. Route Integration Tests

```typescript
const app = createApp(); // Hono app real
const res = await app.request('/api/orders', { method: 'GET', headers });
expect(res.status).toBe(200);
```

- Testam a rota real com middleware real
- DB mockado via `mockedDb` — não require conexão real

### 7. Pure Function Tests

- Serviços extraídos (LOOP 4) testados como funções puras
- Registry injetado por constructor — mockável sem `vi.mock`

### 8. Naming Convention

- Arquivos: `*.test.ts` (server), `*.test.tsx` (frontend)
- Describers aninhados: `describe('orderService') > describe('create')`
- Testes atômicos: um assert principal por `it`

## Consequências

Positivas:
- Padronização reduz retrabalho em code review
- `mockedDb` pattern eliminou 16 `unbound-method` errors
- Middleware typing eliminou 11 `no-unsafe-call` errors

Negativas:
- `any` em mock de retorno de DB é aceito (Record<string, unknown>)
- Fixtures requerem manutenção quando schema muda
