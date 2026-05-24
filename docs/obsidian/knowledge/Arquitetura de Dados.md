---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/database
---

# Arquitetura de Dados — Postgres ↔ Memory

## Objetivo
Permitir que todo o backend rode em **dois mode**s sem alterar uma linha de rota:

| Modo | Provider | Quando usa |
|---|---|---|
| **postgres** | drizzle + postgres-js | Dev / Produção (precisa `DATABASE_URL`) |
| **memory** | `BaseMemoryRepository` + `EntityStore` | Testes (`NODE_ENV=test`) ou `DATABASE_PROVIDER=memory` |

## Provider selector
```typescript
// server/src/db/provider-selector.ts
//  — Registra provider + capabilities globalmente
getProvider()   // 'postgres' | 'memory'
getCapabilities() // { hasSnapshot, hasReplay, hasChaos, ... }
```

## Registry
O **Registry** é o ponto de entrada único para todas as dependências do backend.

### Postgres (registry.ts)
```typescript
// createRegistry(db, schema, health, tx, provider)
// Cada repo é PostgresRepository<T> amarrado a uma tabela drizzle
repos.restaurants   → PostgresRepository(db, schema.restaurants)
repos.coverageCities → PostgresRepository(db, schema.coverageCities)
...
```

### Memory (registry-memory.ts)
```typescript
// createMemoryRegistry(capabilities)
// Cada repo é BaseMemoryRepository<T> com EntityStore própria
repos.restaurants   → BaseMemoryRepository(store('restaurants'))
repos.coverageCities → BaseMemoryRepository(store('coverageCities'))
...
clearAllMemoryStores()  // reseta todas as stores — usado em afterEach
```

## createDatabase(env) — bootstrapping
```typescript
// Em modo memory:
//   1. setProvider('memory', capabilities)
//   2. Cria _memoryRegistry singleton (reusa entre chamadas dentro do mesmo processo)
//   3. Retorna { registry, provider, capabilities } — drizzle é null/não acessado

// Em modo postgres:
//   1. postgres(DATABASE_URL) → cliente
//   2. drizzle(cliente, { schema: schemaModule })
//   3. Retorna { registry (drizzle), provider, capabilities }
```

## DB proxy
```typescript
export const db = new Proxy({} as drizzle, {
  get(target, prop) {
    if (provider === 'memory') return undefined;  // acesso silencioso
    return getOrCreateDatabase()[prop];
  }
});
```
Rotas que usam `db` diretamente funcionam em postgres; em memory devem usar `registry.repos`.

## Capacidades por provider
```typescript
CAPABILITIES.postgres  = { hasSnapshot: false, hasTelemetry: true, hasReplay: false, hasChaos: false, hasOfflinePersistence: false }
CAPABILITIES.memory   = { hasSnapshot: true,  hasTelemetry: false, hasReplay: false, hasChaos: false, hasOfflinePersistence: false }
```

## Schema drizzle (schema/index.ts)
```typescript
export interface Tables {
  restaurants:       typeof restaurants
  coverageCities:    typeof coverageCities
  // ... 89 tabelas ao todo
}

export const tables: Tables = { restaurants, coverageCities, ... }
```

## Config (config.ts)
```typescript
// DATABASE_URL é opcional se DATABASE_PROVIDER=memory
env.DATABASE_URL       // opcional (string vazia em modo memory)
env.DATABASE_PROVIDER  // 'postgres' | 'memory'
env.NODE_ENV // 'development' | 'production' | 'test'
```

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[DATABASE]]
