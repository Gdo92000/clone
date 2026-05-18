# Configuration

## Environment Variables (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Sim | — | PostgreSQL connection string |
| `JWT_SECRET` | Sim (prod) | `dev-secret-change-in-production` | Chave para assinar tokens JWT |
| `CORS_ORIGINS` | Não | `http://localhost:5173,http://localhost:3001` | Origens CORS permitidas (vírgula) |
| `VITE_MOCK` | Não | — | Ativa dados mockados em dev (`true`) |
| `PORT` | Não | `3001` | Porta do servidor Hono |

## Build Config

### TypeScript
- `tsconfig.json` — referências para `tsconfig.app.json` (app) + `tsconfig.node.json` (server)
- `server/tsconfig.json` — `noEmit: true` (servidor executado via `tsx`)
- TypeScript 6.x com strict mode

### Vite
- `vite.config.ts` — React plugin, basic SSL, proxy config
- Proxy de `/api/photon` para photon.komoot.io (geocoding)
- Proxy de `/api/nominatim` para nominatim.openstreetmap.org (geocoding)
- Proxy de `/api/restaurants`, `/api/health`, `/api/operations`, `/api/holidays` para Hono em `localhost:3001`
- Build: manualChunks separa react, lucide-icons, e outros vendors
- `__USE_MOCK__` definido em build time: `true` apenas em dev com `VITE_MOCK=true`

### Database
- `server/drizzle.config.ts` — Config do Drizzle Kit
- Scripts: `db:generate`, `db:migrate`, `db:studio`

## Server Runtime
- Servidor executado com `tsx` (TypeScript direto, sem compilação)
- Modo watch: `tsx watch server/src/index.ts`
- Dev: `npm run dev` (concurrently: vite + tsx watch)

## ESLint
- ESLint 10.x com TypeScript-ESLint, React, React Hooks, SonarJS, import, promise, unused-imports
- Comando: `npm run lint`
- **A configuração de ESLint não deve ser alterada.**

## Tailwind CSS
- Versão 4 (CSS-first configuration)
- PostCSS plugin (@tailwindcss/postcss)
- tailwind-merge + tailwind-variants para componentes

## Git Hooks
- Nenhum hook configurado atualmente.
- <!-- VERIFY: Confirm there are no husky/lint-staged configs in package.json or .husky/ directory -->
