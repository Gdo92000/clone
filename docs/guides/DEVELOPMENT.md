---
title: Development
aliases:
- Desenvolvimento
- Dev Guide
- Guia de Desenvolvimento
- Workflow
- Dev Workflow
section: guides
tags:
- domain/development
- domain/database
---

# Development

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Frontend + backend em paralelo (Vite + Hono/tsx) |
| `npm run dev:client` | Apenas frontend (Vite, porta 5173) |
| `npm run dev:server` | Apenas servidor (tsx watch, porta 3001) |
| `npm run build` | `tsc -b && vite build` (typecheck + bundle) |
| `npm run lint` | ESLint em todo o projeto |
| `npm run test:run` | Vitest single-pass |
| `npm run test:coverage` | Vitest com cobertura |
| `npm run db:generate` | Drizzle Kit — gerar migração |
| `npm run db:migrate` | Drizzle Kit — aplicar migração |
| `npm run db:studio` | Drizzle Studio (GUI do banco) |

## Workflow de desenvolvimento

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com DATABASE_URL, JWT_SECRET, CORS_ORIGINS

# Rodar dev (frontend + backend)
npm run dev
```

O Vite faz proxy de `/api/*` para `localhost:3001`. Requisições a `/api/photon/*` e `/api/nominatim/*` vão para APIs externas de geocoding.

## TypeScript

Configuração no `tsconfig.app.json` (frontend) e `server/tsconfig.json` (backend).

### Regras obrigatórias

```jsonc
// tsconfig.app.json
{
  "strict": true,
  "verbatimModuleSyntax": true,        // import type obrigatório para type-only
  "exactOptionalPropertyTypes": true,  // proibido undefined em props opcionais
  "noUncheckedIndexedAccess": true,    // acesso a índice retorna T | undefined
  "noPropertyAccessFromIndexSignature": true, // bracket notation p/ index signatures
  "noImplicitOverride": true,          // override keyword obrigatório
  "useUnknownInCatchVariables": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### Quirks

| Config | Impacto |
|--------|---------|
| `verbatimModuleSyntax` | `import type` para imports type-only |
| `exactOptionalPropertyTypes` | Não pode atribuir `undefined` a props opcionais |
| `noUncheckedIndexedAccess` | Index access retorna `T \| undefined` |
| `noPropertyAccessFromIndexSignature` | Usar `obj['key']` em vez de `obj.key` p/ index signatures |
| `erasableSyntaxOnly` (node) | Sem enums com initializers no server tsconfig |
| `noImplicitOverride` | `override` keyword obrigatório |

## ESLint

Configuração em `eslint.config.js` (flat config, ESLint 10).

### Split frontend/backend

- `src/**/*.{ts,tsx}` → strictTypeChecked + React + React Hooks + import rules
- `server/src/**/*.ts` → strictTypeChecked + import rules (sem React)

### Regras principais

| Regra | Severidade | Descrição |
|-------|-----------|-----------|
| `no-console` | warn (allow warn, error) | Sem console.log |
| `no-unused-imports` | error | Imports não usados |
| `@typescript-eslint/no-explicit-any` | error | Sem `any` |
| `@typescript-eslint/no-floating-promises` | error | Promises não tratadas |
| `@typescript-eslint/consistent-type-imports` | error | `import type` consistente |
| `import/no-cycle` | error | Sem ciclos de import |
| `import/no-duplicates` | error | Sem imports duplicados |
| `no-restricted-imports` | error | httpClient só em API modules |

### Proibido

- `eslint-disable`, `@ts-ignore`, `@ts-expect-error`
- `as any`, `as unknown as`, non-null assertion (`!`)
- Reduzir severidade de regras
- Adicionar ignores sem aprovação explícita

## Testing

Vitest com dual project mode (`vitest.config.ts:19-42`):

```ts
// Projeto server (node)
{ name: 'server', include: ['server/src/**/*.test.ts'], environment: 'node' }

// Projeto frontend (jsdom)
{ name: 'frontend', include: ['src/**/*.test.{ts,tsx}'], environment: 'jsdom', setupFiles: ['src/test/setup.ts'] }
```

### MSW (frontend)

- Setup em `src/test/setup.ts` — `server.listen({ onUnhandledRequest: 'bypass' })`
- Handlers em `src/mocks/handlers/`
- Worker em `public/mockServiceWorker.js`
- Mock flag `__USE_MOCK__` sempre `false` em produção

### Executar testes

```bash
npm test              # modo interativo
npm run test:run      # single-pass
npm run test:coverage # com cobertura (v8)
```

## Build

```bash
npm run build
```

Executa:
1. `tsc -b` — typecheck de todos os projetos (app + node)
2. `vite build` — bundle de produção

Rollup config split: `vendor-react`, `vendor-icons`, `vendor-other`.

## Estrutura do projeto

```
src/                          # Frontend React
  api/                        #   Chamadas HTTP (único lugar que importa httpClient)
  components/                 #   Componentes compartilhados
  hooks/                      #   React Query hooks (useQuery/useMutation)
  lib/                        #   Utilitários, rotas
  pages/                      #   Páginas públicas
  modules/                    #   Feature modules por perfil
    auth/                     #     Login, registro
    merchant/                 #     Painel merchant
    admin/                    #     Painel admin
    superadmin/               #     Painel superadmin
    courier/                  #     Painel entregador
    experience/               #     Experiência do cliente
  providers/                  #   Providers React
  services/                   #   Lógica de serviço (auth, etc)
  mocks/                      #   MSW handlers
  test/                       #   Setup de testes
server/                       # Backend Hono
  src/
    routes/                   #   Rotas da API (arquivo por domínio)
    db/
      schema/                 #   Schemas Drizzle (core, customer, merchant, etc)
    middleware/                #   Auth, permission, metrics
    services/                 #   Lógica de negócio
    validations/              #   Schemas Zod específicos do backend
shared/                       # Código compartilhado
  validations/                #   Schemas Zod reutilizados (restaurant, address, etc)
packages/                     # Pacotes internos
  tokens/                     #   @fluxds/tokens (colors, typography, spacing)
  ui/                         #   @fluxds/ui (componentes)
```

## Path aliases (frontend)

```ts
// tsconfig.app.json
"@/*" → "src/*"

// Exemplos de uso
import { ROUTES } from '@/lib/routes'
import { httpClient } from '@/api/httpClient'
import { useRestaurants } from '@/hooks/useRestaurants'
```

## Pacotes internos (@fluxds)

Não há monorepo com workspaces. Os pacotes são referenciados via relative imports:

```ts
// src/App.tsx
import { ThemeProvider } from '../packages/ui/src/context'

// packages/ui/src/index.ts
import { colors } from '@fluxds/tokens' // workspace:* no package.json
```

`packages/tokens/package.json`:
```json
{ "name": "@fluxds/tokens", "exports": { ".": "./src/index.ts" } }
```

`packages/ui/package.json`:
```json
{ "name": "@fluxds/ui", "dependencies": { "@fluxds/tokens": "workspace:*" } }
```

## Adicionar nova funcionalidade

### Nova página

1. Criar componente em `src/pages/` ou `src/modules/{area}/pages/`
2. Adicionar rota em `src/lib/routes.ts` (const `ROUTES`)
3. Importar com `React.lazy` em `src/App.tsx`
4. Adicionar `<Route>` no componente `App`

```tsx
// src/lib/routes.ts
export const ROUTES = {
  MY_NEW_PAGE: '/my-new-page',
}

// src/App.tsx
const MyNewPage = lazy(() => import('./pages/MyNewPage'))

<Route path={ROUTES.MY_NEW_PAGE} element={<Suspense fallback={routeFallback}><MyNewPage /></Suspense>} />
```

### Nova API route (backend)

1. Criar arquivo em `server/src/routes/` exportando `new Hono()`
2. Adicionar schema Zod em `shared/validations/` se reutilizado, ou inline
3. Importar e registrar em `server/src/index.ts`

```ts
// server/src/routes/items.ts
import { Hono } from 'hono'
const items = new Hono()
items.get('/', async (c) => c.json({ message: 'ok' }))
export default items

// server/src/index.ts
import itemsRoutes from './routes/items'
app.route('/api/items', itemsRoutes)
```

### Nova query/mutation (frontend)

1. Criar API function em `src/api/` (usa `httpClient`)
2. Adicionar query keys em `src/api/queryKeys.ts`
3. Criar hook em `src/hooks/` com `useQuery`/`useMutation`
4. Componente chama o hook

```ts
// src/api/itemsApi.ts
import { get } from './httpClient'
export const itemsApi = { list: () => get<ItemDTO[]>('/items') }

// src/api/queryKeys.ts
export const itemsKeys = { all: ['items'] as const }

// src/hooks/useItems.ts
import { useQuery } from '@tanstack/react-query'
import { itemsApi } from '@/api/itemsApi'
import { itemsKeys } from '@/api/queryKeys'
export function useItems() {
  return useQuery({ queryKey: itemsKeys.all, queryFn: itemsApi.list })
}
```

## Alterações no banco de dados

1. Modificar schema em `server/src/db/schema/` (subdiretórios: `core/`, `customer/`, `merchant/`, etc.)
2. Exportar em `server/src/db/schema/index.ts`
3. Gerar migração: `npm run db:generate`
4. Revisar SQL gerado em `drizzle/{timestamp}.sql`
5. Aplicar: `npm run db:migrate`

Regras:
- Nunca editar migration já aplicada
- Toda alteração de schema gera nova migration
- Proibido alterar banco manualmente fora do Drizzle

## Vite proxy

| Path | Target |
|------|--------|
| `/api/photon/*` | `https://photon.komoot.io/api` |
| `/api/nominatim/*` | `https://nominatim.openstreetmap.org` |
| `/api/viacep/*` | `https://viacep.com.br` |
| `/api/ipapi/*` | `https://ipapi.co` |
| `/api/ip-api/*` | `http://ip-api.com` |
| `/api/*` | `http://localhost:3001` |

## Git

### .gitignore

Arquivos gerados (`dist/`, `node_modules/`, `coverage/`, `*.local`), logs, debug/temp (`_auth*`, `_server*`, `contexto.txt`), `.env`.

### Commits

- Commits atômicos por funcionalidade
- Mensagens descritivas em português ou inglês (consistente com o repo)
- Não commitar secrets, `.env`, `dist/`, `node_modules/`
- Não forcar push, não usar `--no-verify`

### Branches

- PRs devem ser revisados antes do merge
- Criar branch limpo com `gsd-pr-branch` (filtra commits `.planning/`)

## Code review

### Checklist

- [ ] Sem `any`, sem casting inseguro, sem non-null assertion
- [ ] Sem `eslint-disable`, `@ts-ignore`, `@ts-expect-error`
- [ ] `import type` para type-only
- [ ] Sem imports circulares
- [ ] Sem imports cruzando camadas arquiteturais
- [ ] Zod validation em toda rota
- [ ] Estados loading/error/empty explícitos
- [ ] Sem console.log (apenas warn/error permitidos)
- [ ] Query keys centralizadas e tipadas

### Validação obrigatória

Toda alteração deve passar:
1. Lint: `npm run lint` (zero erros)
2. Typecheck: `npm run build` (ou `npx tsc -b` — zero erros)
3. Testes afetados: `npm run test:run` (passando)
4. Build: `npm run build` (sucesso)

## Proibições arquiteturais

- Frontend nunca acessa DB diretamente
- Componentes UI não chamam API diretamente (usam hooks)
- Hooks não contêm regra de negócio pesada
- Services não acessam estado global React
- `httpClient` só pode ser importado dentro de `src/api/`
- Toda chamada HTTP passa pela camada `src/api/`
- DTOs separados de entidades DB
- Zod schemas são source of truth da API
- Cache nunca substitui persistência oficial

## Observações

- `routeFallback` em `App.tsx`: `<div>Carregando modulo...</div>` usa Suspense
- `ErrorBoundary` wrapper no topo do App captura erros não tratados
- `initAuthSync()` é chamado na raiz do módulo para sincronizar auth entre abas
- Tema por área: `ThemeProvider` com `storageKey={fluxds-theme:{area}}`
- Build chunks manuais para React, lucide-react e outros vendors

---

> [!tip] Navegação
> [[MOC — Guias de Desenvolvimento]] · [[Frontend — Estrutura e Padrões]]
