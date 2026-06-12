---
type: worklog
status: active
created_at: 2026-06-12
updated_at: 2026-06-12
related:
  - CURRENT_STATE.md
  - MEMORY.md
  - server/tsconfig.json
  - tsconfig.json
  - tsconfig.app.json
  - tsconfig.node.json
  - server/tsconfig.test.json
  - eslint.config.js
tags:
  - type/worklog
  - tech/typescript
  - domain/core
---

# LOOP 7 — Migração TypeScript 5 → 6

## Escopo

Migrar TypeScript de v5 para v6 (TS6 6.0.3), compatibilizando tsconfigs, corrigindo ~14 erros de tipo no servidor (sem `any`), e ajustando ESLint para parsing de testes.

## Problema

TS6 removeu `moduleResolution: "bundler"` (TS6046), `target: "ES2023"`, flags `verbatimModuleSyntax`/`allowImportingTsExtensions`. A única alternativa `"node16"` exige extensão `.js` em todos os imports (~200+).

## Solução

### Config

| Arquivo | Mudança |
|---------|---------|
| `tsconfig.json` (root) | `moduleResolution: "bundler"` → `"node"` + `ignoreDeprecations: "6.0"` |
| `tsconfig.app.json` | `target: "ESNext"`, `lib: ["ESNext"]`, remove `verbatimModuleSyntax`/`allowImportingTsExtensions`/`strictBuiltinIteratorReturn` |
| `tsconfig.node.json` | `module: "Node16"`, `moduleResolution: "node16"`, `target: "ESNext"` |
| `server/tsconfig.json` | `moduleResolution: "node"` + `ignoreDeprecations`, strict flags explícitas, `exclude` test files |
| `server/tsconfig.test.json` | **Criado** — extends base, inclui test files para ESLint |
| `eslint.config.js` | Split backend em source (`projectService`) + test (`project: tsconfig.test.json`) |
| `.gitignore` | Adicionado `*.tsbuildinfo` |

### Correções de tipo (servidor, sem any)

- **`branches.ts`**: Hono tipado com `AppVariables` — elimina `as string`
- **`orders.ts`**: `company_id ?? undefined` em vez de `null` direto
- **`orderService.ts`**: `TokenPayload` local → import compartilhado; `status` cast explícito
- **`coupons-engine.ts`**: `err.statusCode as 400 | 401 | 403 | 404`
- **`planLimits.ts`**: `(plan as Record<string, unknown>)[limitField]`
- **`index.ts`**: import `additives` adicionado; `as unknown as` removido
- **`franca-dev.seed.ts`**: index signature `[key: string]: unknown` em `SeedFrancaDevResult` — remove 2 `as unknown as`
- **`types/hono.ts`**: `tenantId` adicionado a `AppVariables`

### Correções de lint (auth/index.test.ts)

13 erros `no-unsafe-*` por `import()` dinâmico + `vi.resetModules()` → substituído por imports estáticos (desnecessários pois `getAuthProvider()` lê `process.env` em tempo de chamada)

### Correções de frontend

- `src/main.tsx`: `import App from './App'` (sem `.tsx` — `allowImportingTsExtensions` removido)
- `DashboardLayout.tsx`: extraído `SidebarBackdrop` — correção de hydration
- `MerchantTeamPage.tsx`: modal manual → `<Modal>` component — hydration + a11y
- `ItemDetailPage.tsx`, `RestaurantDetailPage.tsx`: `bottom-20` → `bottom-[72px]` (CTA overlap)

## Validação

| Comando | Status |
|---------|--------|
| `npm run build` | ✅ Sucesso |
| Server tests | ✅ 86 files, 624 passed |
| Full suite | ✅ All green |
| Lint (files modificados) | ✅ 0 erros |

## Commit

`5f2b835` — fix(ts6): migrate TypeScript 5 to 6 — moduleResolution, strict flags, ~14 type errors (21 files)
