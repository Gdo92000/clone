	# Flux Delivery — AGENTS.md

	## Quick start

	```sh
	npm install                # install dependencies
	npm run dev                # frontend (Vite) + backend (Hono/tsx) concurrently
	npm run dev:client         # frontend only (vite --host, port 5173)
	npm run dev:server         # backend only (tsx watch, port 3001)
	npm run build              # tsc -b && vite build (typecheck THEN bundle)
	npm run lint               # ESLint flat config, covers src/ and server/src/
	npm test                   # vitest interactive
	npm run test:run           # vitest single-pass
	npm run test:coverage      # vitest run --coverage (v8 provider)
	```

	## Architecture

	- **Multi-profile delivery SaaS**: Client, Merchant, Admin, Superadmin, Courier
	- **Frontend**: React 19, Vite 8, Tailwind CSS 4 (CSS-first via `@tailwindcss/postcss`), TanStack React Query 5, React Router 7
	- **Backend**: Hono 4 + `@hono/node-server`, Drizzle ORM 0.45, Zod 4
	- **Database**: PostgreSQL (Supabase). Schema: `server/src/db/schema/` (modular subdirs: `core/`, `customer/`, `merchant/`, etc.). Migrations in `drizzle/`.
	- **Auth**: JWT (HS256 via `@hono/jwt`), bcryptjs, session refresh tokens
	- **Packages** (local): `packages/tokens/` (@fluxds/tokens — colors, typography, spacing) and `packages/ui/` (@fluxds/ui — React components)
	- **Monorepo**: NOT a workspaces monorepo. Packages referenced via relative imports in source (e.g. `../../packages/ui/src/context`). Dependencies managed from root `package-lock.json`.

	## Dev server proxy (Vite, port 5173 → backend port 3001)

	| Path | Target |
	|------|--------|
	| `/api/photon/*` | `https://photon.komoot.io/api` (geocoding autocomplete) |
	| `/api/nominatim/*` | `https://nominatim.openstreetmap.org` (geocoding) |
	| `/api/*` | `http://localhost:3001` (app backend) |

	## Path aliases (tsconfig.app.json)

	`@/*` → `src/*`, plus `@/components/*`, `@/modules/*`, `@/hooks/*`, `@/services/*`, `@/api/*`, `@/providers/*`, `@/repositories/*`, `@/useCases/*`, `@/mappers/*`, `@/models/*`, `@/dto/*`, `@/storage/*`, `@/utils/*`, `@/types/*`

	## Testing (Vitest + MSW)

	- **Dual project config**: `server` (node) and `frontend` (jsdom) — see `vitest.config.ts:19-42`
	- Frontend tests use **MSW** (`msw@2`). Setup at `src/test/setup.ts` auto-starts MSW before all tests (`server.listen`). Worker at `public/mockServiceWorker.js`.
	- Test files: `src/**/*.test.{ts,tsx}` for frontend, `server/src/**/*.test.ts` for backend
	- MSW configured with `onUnhandledRequest: 'bypass'` — won't fail on unhandled requests
	- Mock mode flag `__USE_MOCK__` exists for backward compat but is **always `false`** in production

	## TypeScript quirks

	| Setting | Impact |
	|---------|--------|
	| `verbatimModuleSyntax: true` | Must use `import type` for type-only imports |
	| `exactOptionalPropertyTypes: true` | Cannot assign `undefined` to optional properties |
	| `noUncheckedIndexedAccess: true` | Index access returns `T \| undefined` |
	| `noPropertyAccessFromIndexSignature: true` | Must use bracket notation for index signatures |
	| `erasableSyntaxOnly: true` (node tsconfig) | No enums with initializers in node config |
	| `noImplicitOverride: true` | Must use `override` keyword |

	## ESLint

	- Flat config (`eslint.config.js`), ESLint 10 compatible
	- Frontend/backend lint split:
	  - Frontend: `src/**/*.{ts,tsx}`
	  - Backend: `server/src/**/*.ts`
	- Uses:
	  - `@eslint/js`
	  - `typescript-eslint`
	  - `eslint-plugin-react`
	  - `eslint-plugin-react-hooks`
	  - `eslint-plugin-react-refresh`
	  - `eslint-plugin-unused-imports`
	  - `eslint-plugin-import`
	- Type-aware linting enabled via:
	  - `typescript-eslint strictTypeChecked`
	  - `parserOptions.project = true`
	- React hooks validation enabled via:
	  - `react-hooks recommended rules`
	- Architectural protections:
	  - Prevent direct `httpClient` imports outside API modules
	  - Detect import cycles
	  - Detect duplicate imports
	- Async safety rules enabled:
	  - `no-floating-promises`
	  - `await-thenable`
	  - `no-misused-promises`
	- Key rules:
	  - `no-console`: warn (`warn`, `error` allowed)
	  - `unused-imports/no-unused-imports`: error
	  - `@typescript-eslint/no-explicit-any`: error
	  - `@typescript-eslint/no-unused-vars`: warn (ignore `_` prefix)
	  - `@typescript-eslint/consistent-type-imports`: error
	- Ignored:
	  - `dist/`
	  - `node_modules/`
	  - `drizzle/`
	  - `*.config.*`
	  - `scripts/`
	  - `.opencode/`
	  - `.roo/`
	  - `.windsurf/`
	  - `coverage/`
	  - `*.d.ts`
	- Goals:
	  - Prevent architectural bypasses
	  - Enforce HTTP layer consistency
	  - Reduce dead code
	  - Improve async safety
	  - Prevent circular dependencies
	  - Strengthen type integrity

	1. ## ESLint

	É expressamente proibido:
	- desabilitar regras
	- reduzir severidade
	- adicionar ignores
	- usar `eslint-disable`
	- usar `@ts-ignore`
	- usar `@ts-expect-error`
	- alterar tsconfig
	- relaxar tipagem
	- modificar configuração para mascarar problemas

	como mecanismo para ocultar, ignorar ou mascarar erros

	Todo erro deve ser corrigido na origem do problema.

	Qualquer exceção deve:
	1. ser tecnicamente justificada;
	2. documentada;
	3. aprovada explicitamente antes da alteração.

	## DB / Drizzle

	```sh
	npm run db:generate    # drizzle-kit generate --config=server/drizzle.config.ts
	npm run db:migrate     # drizzle-kit migrate --config=server/drizzle.config.ts
	npm run db:studio      # drizzle-kit studio --config=server/drizzle.config.ts
	```

	- Schema entrypoint: `server/src/db/schema/index.ts` (re-exports from sub-modules)
	- ORM plugin in opencode: `flux_sync_db_schema` auto-generates + applies migrations when schema changes
	- ⚠ `drizzle-kit migrate` and any `drop` command require explicit user approval (opencode.json permissions)

	## Required env vars (copy `.env.example` → `.env`)

	| Var | Purpose |
	|-----|---------|
	| `DATABASE_URL` | PostgreSQL connection string |
	| `JWT_SECRET` | HMAC secret for JWT tokens |
	| `CORS_ORIGINS` | Comma-separated allowed origins |

	## openCode integrations

	- **Plugin**: `.opencode/plugins/flux-delivery-tools.ts` — 3 tools: `flux_sync_db_schema` (generate+migrate), `flux_create_feature_module` (scaffold profile module), `flux_validate_project` (lint + build)
	- **MCP**: Stitch (Google UI gen), Context7 (docs), Playwright (E2E), shadcn-ui (components)
	- **Instruct files**: `.opencode/ag-kit-main/AGENT_FLOW.md` loaded alongside this file

	## Key conventions

	- **Route code-splitting**: Every page is lazy-loaded via `React.lazy(() => import('./pages/...'))` in `App.tsx`
	- **Tailwind**: v4 CSS-first config (`@tailwindcss/postcss` plugin, no `tailwind.config.js`), `tailwind-variants` for component variants
	- **Toast**: Sonner via `<Toaster/>` in `ToastProvider`
	- **Modules**: Feature modules in `src/modules/` by profile: `auth/`, `merchant/`, `admin/`, `saas/`, `superadmin/`, `courier/`, `enterprise/`, `experience/`
	- **`@hono/zod-validator`**: Used in all backend route validation
	- **`concurrently`**: `npm run dev` uses `concurrently -n client,server` for parallel dev servers
	
	## Correções proibidas
	
	É proibido corrigir erros através de:
	- casting inseguro (`as any`, `as unknown as`)
	- non-null assertion (`!`)
	- mocks falsos para mascarar comportamento
	- remoção de código funcional
	- comentários vazios para silenciar lint
	- substituição de tipos por tipos genéricos inseguros
	- criação de wrappers desnecessários apenas para satisfazer tipagem
	- downgrade de dependências sem aprovação
	
	## Imports
	
	- proibido import circular
	- proibido import cruzando camadas arquiteturais
	- frontend nunca acessa DB diretamente
	- componentes UI não podem acessar API diretamente
	- hooks não podem conter regra de negócio pesada
	- services não podem acessar estado global React
	
	## React Query
	
	- toda chamada HTTP deve passar pela camada `api/`
	- `useQuery` e `useMutation` devem estar isolados em hooks
	- componentes não podem executar fetch diretamente
	- query keys devem ser centralizadas e tipadas
	- invalidations devem ser explícitas
	
	## Validação
	
	- toda entrada HTTP deve validar via Zod
	- proibido confiar em tipos do frontend
	- DTOs devem ser separados de entidades DB
	- schemas Zod são source of truth da API
	
	## Segurança
	
	- nunca logar tokens
	- nunca retornar stacktrace ao cliente
	- nunca expor secrets em frontend
	- cookies sensíveis devem usar httpOnly quando aplicável
	- validação de autorização obrigatória em rotas privadas
	
	## Migrations
	
	- nunca editar migration já aplicada
	- toda alteração de schema deve gerar nova migration
	- migrations devem ser determinísticas
	- proibido alterar banco manualmente fora do Drizzle
	
	## Execução obrigatória
	
	Toda alteração deve seguir:
	1. alterar código;
	2. executar lint;
	3. executar typecheck;
	4. executar testes afetados;
	5. validar build;
	6. somente então concluir tarefa.
	
	É proibido declarar sucesso sem validação executada.
	
	## Higiene do repositório
	
	- proibido criar arquivos temporários permanentes
	- remover arquivos de debug antes de concluir
	- proibido deixar código comentado morto
	- proibido deixar logs temporários
	
	## Critério de conclusão
	
	Uma tarefa só pode ser considerada concluída quando:
	- lint = sem erros
	- TypeScript = sem erros
	- build = sucesso
	- testes afetados = sucesso
	- sem warnings críticos
	- sem regressão arquitetural
	
	## Fail-fast
	
	- proibido fallback silencioso para mascarar falhas
	- erros críticos devem falhar explicitamente
	- proibido retornar sucesso parcial sem sinalização
	- toda degradação funcional deve ser registrada
	
	## Observabilidade
	
	- logs devem ser estruturados
	- proibido console.log aleatório
	- erros devem incluir contexto mínimo rastreável
	- correlation/request id obrigatório em fluxos críticos
	
	## Performance
	
	- evitar re-renders desnecessários
	- evitar queries duplicadas
	- lazy loading obrigatório para rotas grandes
	- componentes pesados devem ser memoizados quando necessário
	- evitar N+1 queries no backend
	
	## Transações
	
	- operações críticas devem usar transação
	- escrita concorrente deve ser protegida
	- evitar race conditions
	- consistência deve prevalecer sobre conveniência
	
	## Source of truth
	
	- estado derivado não deve duplicar source of truth
	- cache nunca substitui persistência oficial
	- frontend nunca assume persistência sem confirmação backend
	
	## Acessibilidade
	
	- inputs devem possuir label
	- botões devem possuir texto acessível
	- navegação por teclado não pode quebrar
	- contraste mínimo deve ser respeitado
	
	## HTTP
	
	- proibido retornar 200 para erro
	- status HTTP devem refletir o resultado real
	- responses devem ser tipadas
	- erros devem possuir payload consistente
	
	## Integridade
	
	- proibido assumir comportamento sem verificar implementação real
	- proibido inventar APIs, tipos, rotas ou tabelas
	- toda integração deve ser validada na codebase existente
	
	## Hierarquia de prioridade
	
	Em caso de conflito:
	1. integridade de dados
	2. segurança
	3. arquitetura
	4. corretude funcional
	5. performance
	6. conveniência
	
	## Non-null assertion
	
	- non-null assertion (`!`) proibido fora de casos tecnicamente inevitáveis e documentados
	
	## Correções proibidas
	
	É proibido corrigir erros através de:
	- casting inseguro (`as any`, `as unknown as`)
	- non-null assertion (`!`)
	- mocks falsos para mascarar comportamento
	- remoção de código funcional
	- comentários vazios para silenciar lint
	- substituição de tipos por tipos genéricos inseguros
	- criação de wrappers desnecessários apenas para satisfazer tipagem
	- downgrade de dependências sem aprovação
	
	## Imports
	
	- proibido import circular
	- proibido import cruzando camadas arquiteturais
	- frontend nunca acessa DB diretamente
	- componentes UI não podem acessar API diretamente
	- hooks não podem conter regra de negócio pesada
	- services não podem acessar estado global React
	
	## React Query
	
	- toda chamada HTTP deve passar pela camada `api/`
	- `useQuery` e `useMutation` devem estar isolados em hooks
	- componentes não podem executar fetch diretamente
	- query keys devem ser centralizadas e tipadas
	- invalidations devem ser explícitas
	
	## Validação
	
	- toda entrada HTTP deve validar via Zod
	- proibido confiar em tipos do frontend
	- DTOs devem ser separados de entidades DB
	- schemas Zod são source of truth da API
	
	## Segurança
	
	- nunca logar tokens
	- nunca retornar stacktrace ao cliente
	- nunca expor secrets em frontend
	- cookies sensíveis devem usar httpOnly quando aplicável
	- validação de autorização obrigatória em rotas privadas
	
	## Migrations
	
	- nunca editar migration já aplicada
	- toda alteração de schema deve gerar nova migration
	- migrations devem ser determinísticas
	- proibido alterar banco manualmente fora do Drizzle
	
	## Execução obrigatória
	
	Toda alteração deve seguir:
	1. alterar código;
	2. executar lint;
	3. executar typecheck;
	4. executar testes afetados;
	5. validar build;
	6. somente então concluir tarefa.
	
	É proibido declarar sucesso sem validação executada.
	
	## Higiene do repositório
	
	- proibido criar arquivos temporários permanentes
	- remover arquivos de debug antes de concluir
	- proibido deixar código comentado morto
	- proibido deixar logs temporários
	
	## Critério de conclusão
	
	Uma tarefa só pode ser considerada concluída quando:
	- lint = sem erros
	- TypeScript = sem erros
	- build = sucesso
	- testes afetados = sucesso
	- sem warnings críticos
	- sem regressão arquitetural
