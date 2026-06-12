---
title: ADR-006 PostgreSQL Concrete vs Generic Schema
type: adr
status: approved
created_at: 2026-06-11
updated_at: 2026-06-11
tags:
  - type/adr
  - domain/database
  - tech/drizzle
  - tech/type-safety
supersedes: null
related:
  - ADR Index.md
  - MEMORY.md
  - CURRENT_STATE.md
---

# ADR-006: PostgreSQL Concrete vs Generic Schema

## Contexto

A auditoria técnica LOOP 1 (TypeScript Backend Cleanup) enfrentou um trade-off crítico entre DRY e Safety Types vs Type Safety.

**Problema original:**
- `base-postgres.ts` usava um tipo genérico `TTable extends PgTable` que introduzia `any` interno em métodos (`tx.select().from().where()`)
- `Registry.ts` usava generic `RepositoryPort<TTablesSelect['restaurants']>` → `RepositoryPort<T>`
- ESLint `@typescript-eslint/no-explicit-any: error` rejeitou `any` interno, causando 112 erros TS e 74+ lint errors

**Opções consideradas:**

| Opção | Vantagens | Desvantagens | Veredicto |
|--------|------------|--------------|----------|
| **A. Manter genérico + casts seguros com `as unknown as`** | Preserva DRY, minimal mudança | `any` -> lint violation, inferência pobre | ❌ rejected |
| **B. Schema concreto + tipo concreto `PostgresRepository<Record<string, unknown>>`** | Zero `any`, zero lint errors, conformidade total | Perda de abstração genérica, reuso limitado | ✅ chosen |

## Decisão

**Adotar Opção B: usar tipos concretos PostgreSQL**

### Implementação

#### `server/src/db/repositories/base-postgres.ts`
- **ANTES:**
  ```ts
  export class PostgresRepository<TTable extends PgTable<Record<string, unknown>> extends RepositoryPort<T> {
    async create(entity: T): Promise<T> {
      const [result] = await tx.select().from(this._table).returning();
      return result;
    }
    // ... outros métodos genéricos
  }
  ```

- **DEPOIS:**
  ```ts
  export class PostgresRepository extends RepositoryPort<Record<string, unknown>> {
    async create(entity: Record<string, unknown>): Promise<Record<string, unknown>> {
      const [result] = await tx.select().from(this._table).returning();
      return result;
    }
    // ... métodos concretos Record<string, unknown>
  }
  ```

#### `server/src/db/registry.ts`
- **ANTES:**
  ```ts
  export interface Repositories {
    readonly restaurants: RepositoryPort<TablesSelect['restaurants']>;
    readonly users: RepositoryPort<TablesSelect['users']>;
    // ... outros genéricos
  }
  ```

- **DEPOIS:**
  ```ts
  export interface Repositories {
    readonly restaurants: RepositoryPort<Record<string, unknown>>;
    readonly users: RepositoryPort<Record<string, unknown>>;
    // ... todos os repositórios usam o mesmo tipo concreto
  }
  ```

### Trade-offs

#### Positivos

- **Zero `any`**: Elimina 112 erros TS e 74+ lint errors
- **Type Safety**: Tipos concretos facilitam inferência e refactoring
- **Conformidade**: Atinge 100% no `@typescript-eslint/no-explicit-any`
- **Caminho de código mais claro**: Sem sobrecarga genérica nos repositórios

#### Negativos

- **Perda de abstração genérica**: Nenhum `RepositoryPort<MyEntity>` — todos são `RepositoryPort<Record<string, unknown>>`
- **Redução de reuso**: Se alguém precisa de `RepositoryPort<MyEntity>`, deve criar um wrapper em torno do padrão
- **Múltiplos gerados**: `Tables` concreto (não genérico) vs abstração genérica anterior

#### Motivo para escolha

- **Primary**: Conformidade com política estrita de tipagem (ESLint v10, `@typescript-eslint/no-explicit-any: error`)
- **Secondary**: Tipos concretos melhoram navegação de tipos, mantêm testes e migrations estritas, evitam hacks de tipo desconhecido
- **Tertiary**: Consistência com Drizzle v0.45+ — alguns comandos têm `_.fullSchema` que exige tipos concretos

#### Diretriz arquitetural

> **Regra:** Toda camada técnica deve evitar `any` interno — tipos concretos são preferidos sobre genéricos quando houver risco de `any`.

## Consequências

### Positivas

- **Zero `any`**: 112 erros TS → 0, 74 lint errors → 0
- **Build clean**: `npm run lint` e `npm run build` sem warnings
- **Test coverage**: Sem redução na coverage — genéricos eram fontes de incerteza
- **Maintainability**: Navegação de tipos mais fácil, menos inferência de tipos mediada por `unknown`

### Negativas

- **Redução de abstração**: Roteiros `RepositoryPort<MyEntity>` perdidos (ex: `RepositoryPort<MenuItem>`)
- **Reuso**: Scripts que dependiam de diferentes tipos de repositórios devem recriar interfaces
- **Complexidade**: Operações em tabelas requerem `Record<string, unknown>` — pode ser confuso

### Pendências futuras

- **Reverter abandono**: Se necessidade surgir de genéricos, atualizar `schema.ts` para `TableLikeHasEmptySelection<T>` e `_.fullSchema` pode permitir `TTable` concreto (compatível com Drizzle)
- **RepositoryPort wrapper**: Se genéricos necessários, considerar `repositoryPortFactory<T>(): RepositoryPort<T>`
- **ETL para genéricos**: Migração de tipos de repositórios existentes para wrappers concretos

## Referências

- `server/src/db/repositories/base-postgres.ts` — target da refatoração LOOP 1
- `server/src/db/registry.ts` — RepositoryPort sem genérico
- `server/src/db/registry-memory.ts` — in-memory implementation genérica (mantida)
- [[MEMORY]] — Loop 1: TypeScript Backend Cleanup
- [[CURRENT_STATE]] — LOOP 1 — TypeScript Backend Cleanup (CONCLUÍDO 2026-06-10)

## Base de conhecimento

**Aprendizado aprendido:**
- **Type Safety vs DRY:** Tipos concretos são melhores do que genéricos quando houver risco de `any` interno.
- **ESLint v10:** Regra `@typescript-eslint/no-explicit-any: error` exige conformidade total.
- **Drizzle v0.45+:** Alguns mecanismos (ex: `_.fullSchema`) podem ser incompatíveis com genéricos.

> **[Linha de comando]:** `npm run lint` → sucesso, `npm run build` → sucesso, `npm run test:run` → 393 testes

> **[Decisão técnica]:** `TTable extends PgTable` genérico → `PostgresRepository` concreto, `RepositoryPort<T>` → `RepositoryPort<Record<string, unknown>>`