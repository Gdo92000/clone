---
type: audit
status: inventory
domain: server
created_at: 2026-06-01
---

# Inventário de Erros TypeScript — `server/`

Snapshot completo de `npx tsc --noEmit` executado em `server/` em 2026-06-01.

**Total**: 57 erros em 19 arquivos.

## Por código de erro

| Código | Qtd | Categoria |
|--------|:---:|-----------|
| TS2307 | 10 | Cannot find module |
| TS2352 | 9 | Conversion type mismatch |
| TS2345 | 9 | Argument not assignable |
| TS2339 | 7 | Property does not exist |
| TS2769 | 5 | No overload matches call |
| TS2322 | 4 | Type not assignable |
| TS7006 | 2 | Parameter implicit any |
| TS7053 | 2 | Element implicit any |
| TS2344 | 2 | Type does not satisfy constraint |
| TS2554 | 2 | Expected N args, got M |
| TS2578 | 1 | Unused `@ts-expect-error` |
| TS2305 | 1 | No exported member |
| TS1308 | 1 | `await` outside async |
| TS2694 | 1 | Namespace missing export |
| TS1361 | 1 | `import type` used as value |
| **Total** | **57** | |

## Por arquivo

### 1. `src/lib/environmentRuntime.ts` (7 erros)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 1,54 | TS2307 | Cannot find module `./provider` |
| 2,49 | TS2307 | Cannot find module `./provider` |
| 3,99 | TS2307 | Cannot find module `./provider-selector` |
| 4,43 | TS2307 | Cannot find module `./registry-memory` |
| 22,88 | TS2694 | Namespace `drizzle-orm/index` has no exported member `ReturnType` |
| 99,24 | TS2339 | Property `catch` does not exist on type `void` |
| 100,23 | TS2339 | Property `catch` does not exist on type `void` |

**Categoria**: módulos ausentes + drizzle-orm API drift (`ReturnType` removido em versão mais nova) + Promise.thenable quebrado (provavelmente side-effect do erro 22).

### 2. `src/db/repositories/base-postgres.ts` (17 erros)

| Linha | Código | Mensagem resumida |
|:-----:|--------|------------------|
| 54,42 | TS2345 | `TTable` not assignable to `TableLikeHasEmptySelection<TTable> extends true ? DrizzleTypeError<...> : TTable` |
| 55,12 | TS2352 | `PgSelectBase<...>` to `RawQuery<...>` — neither type sufficiently overlaps |
| 59,12 | TS2352 | `Column<any, object, object>` to `DrizzleColumnMarker` — no overlap |
| 65,12 | TS2352 | `RawQuery<...>` to `Promise<X[]>` — missing `catch`, `finally` |
| 69,18 | TS1308 | `await` outside async function |
| 71,13 | TS2345 | mesmo erro TS2345 que linha 54 |
| 72,17 | TS2769 | `eq()` no overload — `DrizzleColumnMarker` not assignable to `Column` |
| 75,5 | TS2322 | `TTable["_"]["columns"][string]` not assignable to `Promise<X \| null>` |
| 80,5 | TS2322 | `Omit<PgSelectBase<...>>` not assignable to `Promise<X[]>` |
| 82,13 | TS2345 | mesmo erro TS2345 que linha 54 |
| 83,17 | TS2769 | mesmo erro TS2769 que linha 72 |
| 91,26 | TS2769 | `db.insert(table).values({ id: '1' })` — object literal may only specify known properties |
| 93,13 | TS2345 | `.returning((rows) => rows[0])` callback signature mismatch |
| 100,17 | TS2769 | mesmo erro TS2769 que linha 72 |
| 102,13 | TS2345 | mesmo TS2345 que linha 93 (signature mismatch) |
| 108,17 | TS2769 | mesmo TS2769 que linha 72 |
| 126,33 | TS2345 | `db.transaction(tx => ...)` — outer fn sig incompatível com inner tx sig |

**Categoria**: drizzle ORM type generics instáveis em `db.transaction`/`db.select`/`db.insert` chain. API mudou entre versões; generics `TTable`, `TFilter`, `TEntity` precisam refit. Provável causa raiz: `drizzle-orm` upgrade sem update dos generics wrapper.

### 3. `src/db/registry-memory.ts` (5 erros)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 14,25 | TS2344 | `T` does not satisfy `Record<string, unknown>` |
| 15,35 | TS2344 | mesmo erro 14 |
| 48,7 | TS2352 | `{ getTransaction: () => undefined; ... }` to `TransactionPort` — `getTransaction` return type incompatível |
| 101,5 | TS2322 | `{ check: () => { ok: boolean; } }` not assignable to `HealthPort` — `check()` should return `Promise<{ok, latencyMs?, error?}>` |
| 103,5 | TS2322 | `{ start: () => TransactionPort }` not assignable to `Transactions` — `start()` should return `Promise<TransactionPort>` |

**Categoria**: contratos `ports/*` exigem `Promise<>` (async) e `Record<string, unknown>` em generics, mas `registry-memory` retorna valores síncronos e usa tipos primitivos.

### 4. `src/db/repositories/base-memory.ts` (3 erros)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 186,44 | TS2345 | `TFilter \| undefined` not assignable to `TFilter` |
| 210,20 | TS2352 | `{ id: string; }` to `TEntity` — TEntity could be different subtype |
| 239,44 | TS2345 | mesmo erro 186 |

**Categoria**: generics memory repository não propagam `| undefined` corretamente, e a inferência de `TEntity` é fraca quando só `id` está disponível.

### 5. `src/db/repositories/memory/memory-coverage-cities.ts` (4 erros)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 2,51 | TS2307 | Cannot find module `./base-memory` |
| 3,29 | TS2307 | Cannot find module `../../ports/repository` |
| 34,22 | TS2339 | Property `store` does not exist on `MemoryCoverageCityRepository` |
| 44,22 | TS2339 | mesmo erro 34 |

**Categoria**: módulo `base-memory.ts` está em `db/repositories/` mas o import usa path relativo errado (`./` em vez de `../`); falta definição de `store` getter no repository.

### 6. `src/db/repositories/memory/memory-restaurants.ts` (4 erros)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 2,51 | TS2307 | Cannot find module `./base-memory` |
| 3,29 | TS2307 | Cannot find module `../../ports/repository` |
| 64,7 | TS7053 | `repos['store']` — implicit any index access |
| 75,17 | TS7053 | mesmo erro 64 |

**Categoria**: idem `memory-coverage-cities.ts` (paths + `store` indexação).

### 7. `src/telemetry/router.ts` (3 erros)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 129,7 | TS2554 | Expected 1-2 args, got 3 |
| 173,53 | TS2339 | `_closed` private in some constituents of intersection, reduced to `never` |
| 249,6 | TS2554 | mesmo erro 129 |

**Categoria**: chamada a função com aridade incorreta + intersection type com propriedade privada em um dos tipos (criou `never`).

### 8. `src/db/index.ts` (1 erro)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 33,13 | TS2352 | `PostgresJsDatabase<Record<string, unknown>> & { $client: Sql<{}>; }` to `Record<string, unknown>` |

### 9. `src/db/registry.ts` (1 erro)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 12,62 | TS2339 | Property `allTables` does not exist on drizzle return type |

### 10. `src/db/fixtures/loader.ts` (1 erro)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 75,17 | TS2352 | `Repositories` to `Record<string, { restore?, reset? }>` — `Repositories` não tem index signature |

### 11. `src/db/fixtures/registry-shots.ts` (2 erros)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 39,17 | TS2352 | mesmo padrão de cast (Repos to Record) |
| 80,17 | TS2352 | mesmo padrão (Repos to Record\|undefined) |

### 12. `src/db/repositories/memory/index.ts` (1 erro)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 1,15 | TS2307 | Cannot find module `./base-memory` |

### 13. `src/db/repositories/memory/memory-transaction.ts` (1 erro)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 2,38 | TS2307 | Cannot find module `../../ports/transaction` |

### 14. `src/lib/resilience/index.ts` (1 erro)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 58,22 | TS1361 | `AppError` imported via `import type` but used as value |

### 15. `src/lib/tenant.ts` (2 erros)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 52,17 | TS7006 | Parameter `c` implicit any |
| 52,20 | TS7006 | Parameter `next` implicit any |

### 16. `src/ports/index.ts` (1 erro)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 1,38 | TS2305 | Module `"./repository"` has no exported member `TransactionPort` |

### 17. `src/telemetry/router.test.ts` (1 erro)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 126,32 | TS2339 | Property `then` does not exist on `void` |

### 18. `src/__tests__/fixtures/load-fixture.test.ts` (1 erro)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 69,7 | TS2578 | Unused `@ts-expect-error` directive |

### 19. `src/__tests__/fixtures/serializer.test.ts` (1 erro)

| Linha | Código | Mensagem |
|:-----:|--------|----------|
| 88,38 | TS2345 | `CircularObj` not assignable to `Record<string, unknown>` |

## Clusters de causa raiz (hipóteses)

### Cluster A — Drizzle ORM generics drift (24 erros)

TS2345, TS2352, TS2769, TS2322, TS2339 em `base-postgres.ts` (17), `base-memory.ts` (3), `registry.ts` (1), `index.ts` (1), `loader.ts` (1), `registry-shots.ts` (2).

**Causa provável**: `drizzle-orm` upgrade (provavelmente v0.27 → v0.30+) alterou assinatura de `db.select()`, `db.insert()`, `db.transaction()` e tipos de retorno. Os generics wrapper `TTable`, `TFilter`, `TEntity`, `RawQuery` não foram refatorados.

### Cluster B — Module path breakage (10 erros TS2307)

Em `lib/environmentRuntime.ts` (4), `db/repositories/memory/*` (6).

**Causa provável**: refator de estrutura de pastas moveu `provider.ts`, `provider-selector.ts`, `registry-memory.ts`, `base-memory.ts`, `ports/repository.ts`, `ports/transaction.ts` mas deixou imports velhos.

### Cluster C — Port contracts inconsistentes (5 erros)

TS2322 em `registry-memory.ts` (HealthPort, Transactions, TransactionPort).

**Causa provável**: ports/contracts exigem `Promise<>` (async-first) mas implementations são síncronas. TS2344 (T não satisfaz `Record<string, unknown>`) reforça.

### Cluster D — Promise.thenable quebrado (3 erros)

TS2339 em `environmentRuntime.ts:99,100` e `telemetry/router.test.ts:126` — `.catch`/`.then` em `void`.

**Causa provável**: side-effect de erros anteriores que confundem a inferência (ex.: `Promise.resolve()` retornando tipo errado).

### Cluster E — Small fixes (12 erros restantes)

TS2339 (4), TS7006 (2), TS7053 (2), TS2305 (1), TS1308 (1), TS1361 (1), TS2554 (2), TS2578 (1), TS2694 (1), TS2344 (2).

**Causa**: mix de imports errados, propriedade faltando, parâmetros sem tipo, `await` misplaced, `import type` usado como valor, aridade incorreta.

## Próximo passo

Plano detalhado de correção em `audit-results/server-ts-stabilization-plan.md`. **Não executar este plano na sessão atual** — fase independente com escopo bem definido.
