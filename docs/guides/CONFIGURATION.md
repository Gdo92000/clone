---
title: Configuration
aliases:
- Configuracao
- Config
- Env Vars
- Environment Variables
section: guides
tags:
- domain/configuration
---

# Configuration

## Environment Variables (.env)

Copy `.env.example` to `.env` and configure:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Sim | — | PostgreSQL connection string |
| `JWT_SECRET` | Sim (prod) | `dev-secret-change-in-production` | Chave para assinar tokens JWT (HS256) |
| `CORS_ORIGINS` | Não | `http://localhost:5173,http://localhost:3001` | Origens CORS permitidas (separadas por vírgula) |
| `VITE_MOCK` | Não | — | Ativa dados mockados em dev (`true`) |
| `PORT` | Não | `3001` | Porta do servidor Hono |

## Build Config

### TypeScript

- `tsconfig.json` — referências para `tsconfig.app.json` (app/frontend) + `tsconfig.node.json` (server)
- `server/tsconfig.json` — `noEmit: true` (servidor executado via `tsx`)
- TypeScript 6.x com strict mode ativado
- `verbatimModuleSyntax: true` — requer `import type` para imports tipo-only
- `exactOptionalPropertyTypes: true` — não permite `undefined` em propriedades opcionais
- `noUncheckedIndexedAccess: true` — acesso a índice retorna `T | undefined`
- `erasableSyntaxOnly: true` (node config) — sem enums com initializers
- `noImplicitOverride: true` — requer `override` keyword

### Vite

- `vite.config.ts` — React plugin, basic SSL, proxy config
- Proxy de `/api/photon` para `https://photon.komoot.io/api` (geocoding autocomplete)
- Proxy de `/api/nominatim` para `https://nominatim.openstreetmap.org` (geocoding)
- Proxy de `/api/*` para `http://localhost:3001` (app backend)
- Build: `manualChunks` separa `react`, `lucide-react`, e outros vendors
- `__USE_MOCK__` definido em build time: `true` apenas em dev com `VITE_MOCK=true`

### Database

- `server/drizzle.config.ts` — Config do Drizzle Kit
- Schema entrypoint: `server/src/db/schema/index.ts` (re-exports from sub-modules)
- Scripts: `db:generate`, `db:migrate`, `db:studio`

### Tailwind CSS

- Versão 4 (CSS-first configuration via `@tailwindcss/postcss`)
- PostCSS plugin (`@tailwindcss/postcss`) — sem `tailwind.config.js`
- `tailwind-merge` + `tailwind-variants` para componentes

### PostCSS

Config in `postcss.config.js`:
```js
plugins: {
  '@tailwindcss/postcss': {},
  autoprefixer: {},
}
```

## Server Runtime

- Servidor executado com `tsx` (TypeScript direto, sem compilação)
- Modo watch: `tsx watch server/src/index.ts`
- Dev: `npm run dev` (concurrently: vite + tsx watch)
- <!-- VERIFY: Production deployment runtime (Node.js version, process manager) -->

## ESLint

- ESLint 10.x com flat config (`eslint.config.js`)
- Plugins: TypeScript-ESLint (strictTypeChecked), React, React Hooks, import, unused-imports
- Regras chave: `no-console` (warn), `no-explicit-any` (error), `no-unused-vars` (warn, `_` prefix)
- Async safety: `no-floating-promises`, `await-thenable`, `no-misused-promises`
- Arquitetura: prevenção de import direto de `httpClient` fora de API modules
- Comando: `npm run lint`
- Cobre: `src/**/*.{ts,tsx}` (frontend) + `server/src/**/*.ts` (backend)
- Ignora: `dist/`, `node_modules/`, `drizzle/`, `*.config.*`, `coverage/`
- **A configuração de ESLint não deve ser alterada** — erros devem ser corrigidos na origem

## Git Hooks

- Nenhum hook configurado atualmente.
- <!-- VERIFY: Confirm there are no husky/lint-staged configs in package.json or .husky/ directory -->

## Path Aliases (tsconfig.app.json)

`@/*` → `src/*`, incluindo aliases para:
- `@/components/*`, `@/modules/*`, `@/hooks/*`, `@/services/*`
- `@/api/*`, `@/providers/*`, `@/repositories/*`, `@/useCases/*`
- `@/mappers/*`, `@/models/*`, `@/dto/*`, `@/storage/*`
- `@/utils/*`, `@/types/*`

## Packages Internos

- `packages/tokens/` (@fluxds/tokens) — design tokens (cores, tipografia, espaçamento)
- `packages/ui/` (@fluxds/ui) — componentes React
- Referenciados via imports relativos no source (ex: `../../packages/ui/src/context`)
- Dependências gerenciadas a partir do root `package-lock.json` (sem workspaces)

> [!tip] Navegação
> ← [[MOC — Guias de Desenvolvimento]] · [[Wiki Central]]
