---
title: LOOP 1 — TypeScript Backend Cleanup
type: worklog
status: concluded
created_at: 2026-06-10
updated_at: 2026-06-10
related:
  - MEMORY.md
  - CURRENT_STATE.md
  - server/src/db/base-postgres.ts
  - server/src/db/registry.ts
  - server/src/routes/orders.ts
  - server/tsconfig.json
tags:
  - type/worklog
  - loop/1
---

# LOOP 1 — TypeScript Backend Cleanup

## Problema

112 erros TypeScript e 74+ lint errors no backend, causados por:

- `base-postgres.ts` — tipo genérico `TTable extends PgTable` com `any` interno em métodos de query
- `registry.ts` — tipos mortos acumulados (`TTablesSelect`, `TablesSelect`, `_TPostgresRow`)
- Rotas — `as string` redundante em `c.get('userBranchId')`, `as any` para cast de enum em `orders.ts`
- `orders.test.ts` — 14 erros de tipo nos mocks Hono
- `tsconfig.json` — TS6307 (arquivos fora do include)

## Solução

1. **base-postgres.ts** — reescrito sem `any`. `PgTable` concreto + `PostgresJsDatabase<Record<string, unknown>>`. `withTransaction` removido (não está na `RepositoryPort`).
2. **registry.ts** — `Repositories` simplificado: `RepositoryPort` sem genérico. Imports limpos.
3. **registry-memory.ts** — `T extends Record<string, unknown>`.
4. **Rotas** — `as string` removido de `c.get()`, `orders.ts` enum cast tipado.
5. **orders.test.ts** — 14 fixes de mock.
6. **tsconfig.json** — `"../shared"` adicionado ao include.

## Trade-off

`Repositories` perdeu o genérico de entidade. Dados retornados como `Record<string, unknown>`. Decisão forçada pelo Drizzle v0.45+ — impossibilitando abstração genérica sobre `PgTable`.

## Resultado

| Métrica | Antes | Depois |
|---------|-------|--------|
| TS errors (server) | 112 | 0 |
| Lint errors (server) | 74+ | 0 |
| Lint warnings | 3 | 0 |
| Build | ❌ falhava | ✅ sucesso |
