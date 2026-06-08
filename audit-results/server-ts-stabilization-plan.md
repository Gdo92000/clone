---
type: plan
status: pending
domain: server
priority: P2
created_at: 2026-06-01
depends_on: none
blocks: none
---

# SERVER_TS_STABILIZATION — Plano de Fase

## Objetivo

Obter `npx tsc --noEmit` sem erros em `server/`.

Baseline: 57 erros em 19 arquivos (vide `audit-results/server-ts-error-inventory.md`).

Critério de aceitação: `cd server && npx tsc --noEmit` retorna 0 (zero) linhas com `error TS`.

## Escopo

### Dentro do escopo

- Corrigir `as` casts sem intermediate `unknown` (TS2352 — 9 ocorrências).
- Reparar imports quebrados (TS2307 — 10 ocorrências em `lib/environmentRuntime.ts`, `db/repositories/memory/*`).
- Adicionar index signature `[key: string]: unknown` à `Repositories` ou ajustar consumers para usar generics wrapper (TS2352 em fixtures — 3 ocorrências).
- Adaptar generics drizzle-orm para assinatura atual (`TTable`, `TFilter`, `TEntity`) — TS2345/TS2352/TS2769/TS2322 em `base-postgres.ts` (17), `base-memory.ts` (3), `registry.ts` (1), `index.ts` (1).
- Sincronizar implementations de `HealthPort`, `Transactions`, `TransactionPort` com contratos de `ports/*` — TS2322 em `registry-memory.ts` (2), TS2344 (2), TS2305 em `ports/index.ts` (1).
- Corrigir `await` fora de async (TS1308 em `base-postgres.ts:69`).
- Corrigir aridade de chamadas (TS2554 em `telemetry/router.ts`).
- Tipar parâmetros implícitos (TS7006 em `lib/tenant.ts:52`).
- Adicionar `getTransaction` ao shape de TransactionPort (TS2352 em `registry-memory.ts:48`).
- Adicionar propriedade `store` aos repositories memory (TS2339 — 4 ocorrências).
- Trocar `import type` por `import` para `AppError` (TS1361 em `lib/resilience/index.ts:58`).
- Remover `as Record<string, unknown>` desnecessário em fixtures (TS2345 em `serializer.test.ts:88`).
- Remover `@ts-expect-error` não usado (TS2578 em `load-fixture.test.ts:69`).
- Reparar types de `drizzle-orm/index` (TS2694 em `lib/environmentRuntime.ts:22` — `ReturnType` removido).

### Fora do escopo

- Novas funcionalidades (rotas, endpoints, casos de uso).
- Autenticação (auth vive no client/ via `src/auth/*`; server tem `authSessions` schema mas não auth provider pattern).
- UI / frontend.
- Refactors funcionais (mudança de comportamento, fluxo de dados, regras de negócio).
- Mudança de regras de negócio (políticas de pricing, cálculo de frete, etc.).
- Mudança de schema do banco.
- Mudança de provedores (postgres ↔ memory).
- Otimizações de runtime / performance.
- Adoção de nova biblioteca / framework.
- Reescrita de `server/` do zero.

## Estratégia

### Abordagem recomendada

**Incremental por cluster**, em ondas. Cada onda valida com `tsc --noEmit` antes de seguir.

Agrupar erros por cluster (vide inventário):

| Onda | Cluster | Qtd | Tipo de mudança | Risco |
|:----:|---------|:---:|-----------------|:-----:|
| 1 | E (small fixes) | 12 | Trivial: tipar, remover, mover `await` | Baixo |
| 2 | B (module paths) | 10 | Corrigir paths relativos em 5 arquivos | Baixo |
| 3 | C (port contracts) | 5 | Adicionar `Promise<>`/`Record<>` em memory impls, expor `TransactionPort` | Médio |
| 4 | A (drizzle generics) | 24 | Refit de generics `TTable`/`TFilter`/`TEntity` em `base-postgres.ts` e `base-memory.ts` | Alto |
| 5 | D (Promise.thenable) | 3 | Side-effect de A/C — deve resolver após onda 4 | Baixo |
| 6 | Validação final | 57 → 0 | `tsc --noEmit` retorna vazio | — |

**Total estimado**: 6 ondas, ~30-50 minutos com disciplina.

### Onda 0 — Setup (opcional, recomendado)

- Confirmar versão atual de `drizzle-orm` em `server/package.json`.
- Confirmar versão de `typescript` em `server/package.json` (e root).
- Ler `server/tsconfig.json` e identificar flags ativas (`strict`, `noImplicitAny`, `exactOptionalPropertyTypes`).
- Verificar se `drizzle-orm` versão é estável ou se upgrade é viável.

### Onda 1 — Small fixes (12 erros)

**Arquivos**: `lib/tenant.ts`, `lib/resilience/index.ts`, `telemetry/router.ts`, `telemetry/router.test.ts`, `__tests__/fixtures/load-fixture.test.ts`, `__tests__/fixtures/serializer.test.ts`.

**Mudanças**:

1. `lib/tenant.ts:52` — adicionar tipos `(c: Context, next: Next) => ...` (2 erros TS7006).
2. `lib/resilience/index.ts:58` — trocar `import type { AppError }` por `import { AppError }` (1 erro TS1361).
3. `telemetry/router.ts:129, 249` — remover terceiro argumento das chamadas (2 erros TS2554).
4. `telemetry/router.ts:173` — desacoplar intersection type que virou `never`; tipar `SpanImpl` corretamente (1 erro TS2339).
5. `telemetry/router.test.ts:126` — provavelmente resolve após correção de `telemetry/router.ts:173` (1 erro TS2339).
6. `__tests__/fixtures/load-fixture.test.ts:69` — remover `@ts-expect-error` não usado (1 erro TS2578).
7. `__tests__/fixtures/serializer.test.ts:88` — remover `as Record<string, unknown>` ou ajustar interface `CircularObj` (1 erro TS2345).

**Validação**: `npx tsc --noEmit 2>&1 | grep -c "error TS"` deve cair de 57 para ~45.

### Onda 2 — Module paths (10 erros)

**Arquivos**: `lib/environmentRuntime.ts`, `db/repositories/memory/index.ts`, `db/repositories/memory/memory-coverage-cities.ts`, `db/repositories/memory/memory-restaurants.ts`, `db/repositories/memory/memory-transaction.ts`.

**Mudanças**:

1. `lib/environmentRuntime.ts:1-4` — corrigir paths:
   - `./provider` → `../db/provider` ou caminho correto
   - `./provider-selector` → idem
   - `./registry-memory` → `../db/registry-memory`
2. `db/repositories/memory/memory-coverage-cities.ts:2,3` — `./base-memory` → `../base-memory`; `../../ports/repository` → `../../../ports/repository`.
3. `db/repositories/memory/memory-restaurants.ts:2,3` — mesmo padrão.
4. `db/repositories/memory/memory-transaction.ts:2` — `../../ports/transaction` → `../../../ports/transaction`.
5. `db/repositories/memory/index.ts:1` — `./base-memory` → `../base-memory`.

**Validação**: erros TS2307 zerados. `npx tsc --noEmit 2>&1 | grep -c "error TS"` deve cair para ~35.

### Onda 3 — Port contracts (5 erros)

**Arquivos**: `ports/index.ts`, `db/registry-memory.ts`, `src/ports/repository.ts` (verificar).

**Mudanças**:

1. `ports/index.ts:1` — expor `TransactionPort` em `ports/repository.ts` (atualmente só exporta `RepositoryPort`, `HealthPort`).
2. `db/registry-memory.ts:14,15` — generics `T` precisam de constraint `T extends Record<string, unknown>` ou similar (TS2344).
3. `db/registry-memory.ts:48` — `TransactionPort` precisa ter `getTransaction(): Promise<unknown>` no contrato (TS2352).
4. `db/registry-memory.ts:101` — `HealthPort.check()` deve retornar `Promise<{ok: boolean; latencyMs?: number; error?: string}>` (TS2322).
5. `db/registry-memory.ts:103` — `Transactions.start()` deve retornar `Promise<TransactionPort>` (TS2322).

**Decisão arquitetural**: ports são contracts — definir primeiro os contracts, depois as impls. Se mudar contracts, verificar consumers em `routes/`, `services/`.

**Validação**: erros TS2305, TS2344 (parcial), TS2322 (parcial) zerados.

### Onda 4 — Drizzle generics (24 erros)

**Arquivos**: `db/repositories/base-postgres.ts`, `db/repositories/base-memory.ts`, `db/registry.ts`, `db/index.ts`, `db/fixtures/loader.ts`, `db/fixtures/registry-shots.ts`.

**Mudanças** (estratégia de refit):

1. `db/registry.ts:12` — substituir `ReturnType<typeof drizzle>['_']['allTables'][string]` por tipo mais explícito (TS2339).
2. `db/repositories/base-postgres.ts:54-126` — refit de:
   - `select()` chain — usar `db.select().from(table).where(eq(table.column, value))` com generics explícitos.
   - `insert()` values — usar `db.insert(table).values(typedObj)` com tipo explícito de row.
   - `transaction()` wrapper — tipar `tx` callback corretamente.
3. `db/repositories/base-memory.ts:186, 210, 239` — propagar `TFilter | undefined` ou usar `TFilter = ...` com default.
4. `db/index.ts:33` — ajustar cast `PostgresJsDatabase<...>` para manter tipo concreto.
5. `db/fixtures/loader.ts:75`, `db/fixtures/registry-shots.ts:39, 80` — adicionar `[key: string]: unknown` à `Repositories` interface em `db/registry.ts:34`, ou usar generics wrapper `Record<EntityName, RepositoryPort<...>>`.

**Risco**: alto. Drizzle type APIs mudam entre minor versions. Recomenda-se:
- Verificar changelog de `drizzle-orm` para a versão instalada.
- Se generics drift for muito severo, considerar pin de versão em `server/package.json`.
- Em último caso, usar `as unknown as` intermediate em pontos específicos.

**Validação**: erros TS2345, TS2352 (parcial), TS2769, TS2322 (parcial) zerados.

### Onda 5 — Promise.thenable (3 erros)

**Arquivos**: `lib/environmentRuntime.ts:99, 100`, `telemetry/router.test.ts:126`.

**Mudanças**: após onda 4, esses erros devem resolver como side-effect. Se persistirem:

1. `lib/environmentRuntime.ts:99, 100` — adicionar `await` ou `return` para garantir `Promise<>`.
2. `telemetry/router.test.ts:126` — ajustar assertion para mock que retorna `Promise<>`.

**Validação**: erros TS2339 (thenable) zerados.

### Onda 6 — Validação final

**Comando**:
```bash
cd server && npx tsc --noEmit
```

**Critério**: zero linhas contendo `error TS`. Exit code 0.

**Adicional**:
- `cd server && npx eslint .` deve continuar 0 erros.
- `cd server && npx vitest run` deve passar (testes existentes do fixtures).
- Se houver testes do server, rodar para garantir que correções de tipos não quebraram runtime.

## Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Drizzle generics muito drift — refit vira refactor grande | Avaliar pin de versão ou upgrade consciente. Se necessário, criar subtarefa para upgrade de drizzle-orm. |
| Mudança em port contracts quebra consumers em `routes/`, `services/` | Mapear consumers antes da onda 3. Se algum quebrar, decidir entre ajustar consumer ou criar nova versão do contract (deprecation). |
| Correções de generics expõem novos erros em outros arquivos | Aceitar — essas ondas são discovery. Orçar tempo extra. |
| Testes do server falham após correções | Rodar `vitest` após cada onda. Se falhar, decidir: fix no teste (regressão real) ou rollback da onda (regressão de tipos). |

## Entregáveis da fase

1. `npx tsc --noEmit` em `server/` retorna 0 erros.
2. `npx vitest run` em `server/` continua passando.
3. `npx eslint .` em `server/` continua 0 erros.
4. `audit-results/server-ts-stabilization-report.md` documentando:
   - Ondas executadas e diff resumido.
   - Erros remanescentes (se algum exigir decisão).
   - Validações pós-correção.
5. Sem regressão em runtime: rotas de `server/` continuam respondendo ao client/ via MSW (já em uso no test:e2e:all com 54/54 verde).

## Não-objetivos

- Não migrar de drizzle-orm para outro ORM.
- Não mudar schema do banco.
- Não adicionar tipagem de runtime (zod, yup, etc.) além do que já existe.
- Não introduzir novos contracts de port.
- Não mudar nomes de exports públicos do `server/`.
- Não migrar para async/await em código que hoje é sync (exceto onde port contract exigir).

## Critério de pronto (DoD)

- [ ] `npx tsc --noEmit` retorna 0.
- [ ] `npx vitest run` retorna 0 falhas.
- [ ] `npx eslint .` retorna 0 erros.
- [ ] `npx tsc --noEmit` no root (client) continua 0.
- [ ] Playwright e2e:all (54 cenários) continua passando.
- [ ] Audit report publicado em `audit-results/`.
- [ ] `CURRENT_STATE.md` atualizado para refletir status pós-fase.
- [ ] Sem novos TODOs ou `@ts-ignore` introduzidos.

## Estimativa

- **Onda 1** (small fixes): 5-10 min
- **Onda 2** (paths): 5 min
- **Onda 3** (ports): 10-15 min
- **Onda 4** (drizzle): 20-40 min
- **Onda 5** (thenable): 0-5 min
- **Onda 6** (validação): 5 min
- **Total**: 45-80 min

## Não executar agora

Esta fase é backlog técnico. Item 4 (auth-architecture.md) tem prioridade e é independente desta fase.
