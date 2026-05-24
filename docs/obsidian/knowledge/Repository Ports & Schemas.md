---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/database
---

# Repository Ports & Schemas

## RepositoryPort (ports/repository.ts)
```typescript
export interface RepositoryPort<TEntity, TFilter, TCreate, TUpdate> {
  findMany(filter?: TFilter, tenantId?: string): Promise<TEntity[]>
  findById(id: string, tenantId?: string): Promise<TEntity | null>
  findByIds(ids: string[], tenantId?: string): Promise<TEntity[]>
  create(data: TCreate, tenantId?: string): Promise<TEntity>
  update(id: string, data: TUpdate, tenantId?: string): Promise<TEntity | null>
  remove(id: string, tenantId?: string): Promise<boolean>
  count(filter?: TFilter, tenantId?: string): Promise<number>
  exists(id: string, tenantId?: string): Promise<boolean>
}
```

## Implementações

### PostgresRepository
- `server/src/db/repositories/base-postgres.ts:35`
- Encapsula `db.select().from(table)` / `.insert().values()` / `.update().set()` / `.delete().where()`
- Usa `eq()` com cast para `DrizzleColumnMarker` (tipos drizzle vs TS genéricos)
- Retorna `$inferSelect` tipado por tabela

### BaseMemoryRepository
- `server/src/db/repositories/base-memory.ts:162`
- Armazenamento em `EntityStore` por namespace
- `findMany`, `findById`, `create`, `update`, `remove`, `count`, `exists` → versões síncronas da store
- **tenantFilter**: injeta `tenantId` no `where` do filtro
- **snapshot/restore**: serializa/deserializa loja completa
- **Tenant filter**: verifica `tenantId === item[tenantKey]` antes de retornar

## Repositórios específicos (memory)

| Arquivo | Entidade | Observações |
|---|---|---|
| `memory-restaurants.ts` | restaurants | Filtro haversine por lat/lon/radius |
| `memory-coverage-cities.ts` | coverageCities | Lookup por `id` string |
| *(criados no futuro)* | ... | Seguem padrão BaseMemoryRepository |

## Contract Validation (Zod — shared/validations/)

Todos os schemas vivem em `shared/` para serem usados tanto pelo backend quanto pelo MSW.

### coverageCity.ts
```typescript
coverageCityResponseSchema     //单个 cidade
coverageCityListResponseSchema // lista
coverageCityInputSchema        // PUT/POST DTO
```

### plan.ts
```typescript
planResponseSchema
planListResponseSchema
createPlanSchema
```

### globalCoupon.ts
```typescript
globalCouponResponseSchema
globalCouponListResponseSchema
createGlobalCouponSchema
updateGlobalCouponSchema
```

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[DATABASE]]
