---
type: state
status: in_progress
created_at: 2026-06-08
updated_at: 2026-06-09
related:
- Fase 38
- Fase 39
- MEMORY.md
- server/src/db/schema/
- server/src/routes/branches.ts
- server/src/routes/menu-items.ts
---

# CURRENT_STATE

## Fase Atual
**Fase 38-39 — Concluidas e Validadas**

## Ultimo Commit Valido
`e602c067` — C9: Config, Docs & Tooling (pushado para origin/main)
— Commits de Fases 35-39 ainda nao pushados.

## Comandos de Validacao
| Comando | Status |
|---------|--------|
| `npm run lint` | ✅ 0 erros |
| `npx tsc -b` | ✅ 0 erros |
| `npm run test:run` | ✅ 376 pass (32 files) |
| `npm run build` | ✅ Build sucesso (21.39s) |
| FKs materializadas | ✅ 53/53 |
| Migration 0015 | ⏳ Gerada, pendente aplicacao (DB indisponivel) |

## Bloqueios
- Migration `0015` nao aplicada (DB Supabase indisponivel no ambiente dev)

## Status Geral
| Dominio | Status |
|---------|--------|
| Frontend (Vite build) | ✅ |
| Backend (tsc + build) | ✅ |
| Testes (vitest) | ✅ 376/376 |
| Lint (ESLint) | ✅ 0 erros |
| DB Migrations (0011-0014) | ✅ Aplicadas |
| Migration 0015 | ⏳ Gerada, pendente |
| FKs materializadas | ✅ 53 (schema = DB) |
| Working tree | 🔶 20 files modificados (nao commitados) |

## Fases 38-39 — Concluidas

### Fase 38 — Unificar menu_items ✅
- Schema: `menu_items` com `branch_id`, `is_visible_to_consumer`, `updated_at`
- Relations: `branchesRelations.menuItems` (era `merchantMenuItems`)
- Rotas publicas: filtro `is_visible_to_consumer = true`
- Seed: plans, company, branches, 16 menu items
- Migration `0015_many_puff_adder.sql`: 3 cols + FK + 2 indexes

### Fase 39 — Additives ✅
- `findAdditives()` corrigido (Postgres + Memory repo)
- Rotas publicas com additives embutidos (sql template literal)
- CRUD merchant: `POST/PUT/DELETE /:id/menu-items/:itemId/additives`
- `CartContext.tsx`: `additiveSetsEqual()` para merge de carrinho
- Seeds: 22 registros de additives

## Proximo Passo
1. Aplicar migration 0015 quando DB disponivel
2. Commits das Fases 35-39
3. Fase 40 — Push Notifications
4. Fase 41 — Analytics e Financeiro
5. Fase 42 — Enterprise (decisao: produto real ou remover paginas orfas)
