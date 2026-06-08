---
type: guide
status: active
domain: domain/core
layer: layer/L1
moc: MOC Obsidian System
semantic_priority: 5
tags:
  - type/guide
  - domain/core
  - tech/markdown
aliases:
  - AGENTS
  - Agent Instructions
created_at: 2026-05-23
updated_at: 2026-05-24
---

# Flux Delivery — AGENTS.md

## Quick start


npm install                # install dependencies
npm run dev                # frontend (Vite) + backend (Hono/tsx) concurrently
npm run dev:client         # frontend only (vite --host, port 5173)
npm run dev:server         # backend only (tsx watch, port 3001)
npm run build              # tsc -b && vite build (typecheck THEN bundle)
npm run lint               # ESLint flat config, covers src/ and server/src/
npm test                   # vitest interactive
npm run test:run           # vitest single-pass
npm run test:coverage      # vitest run --coverage (v8 provider)


## Architecture

- **Multi-profile delivery SaaS**: Client, Merchant, Admin, Superadmin, Courier
- **Frontend**: React 19, Vite 8, Tailwind CSS 4 (CSS-first via "@tailwindcss/postcss"), TanStack React Query 5, React Router 7
- **Backend**: Hono 4 + "@hono/node-server", Drizzle ORM 0.45, Zod 4
- **Database**: PostgreSQL (Supabase). Schema: "server/src/db/schema/" (modular subdirs: "core/", "customer/", "merchant/", etc.). Migrations in "drizzle/".
- **Auth**: JWT (HS256 via "@hono/jwt"), bcryptjs, session refresh tokens
- **Packages** (local): "packages/tokens/" (@fluxds/tokens — colors, typography, spacing) and "packages/ui/" (@fluxds/ui — React components)
- **Monorepo**: NOT a workspaces monorepo. Packages referenced via relative imports in source (e.g. "../../packages/ui/src/context"). Dependencies managed from root "package-lock.json".

### Dev server proxy (Vite, port 5173 → backend port 3001)

| Path | Target |
|------|--------|
| "/api/photon/*" | "https://photon.komoot.io/api" (geocoding autocomplete) |
| "/api/nominatim/*" | "https://nominatim.openstreetmap.org" (geocoding) |
| "/api/*" | "http://localhost:3001" (app backend) |

### Path aliases (tsconfig.app.json)

"@/*" → "src/*", plus "@/components/*", "@/modules/*", "@/hooks/*", "@/services/*", "@/api/*", "@/providers/*", "@/repositories/*", "@/useCases/*", "@/mappers/*", "@/models/*", "@/dto/*", "@/storage/*", "@/utils/*", "@/types/*"

## Testing (Vitest + MSW)

- **Dual project config**: "server" (node) and "frontend" (jsdom) — see "vitest.config.ts:19-42"
- Frontend tests use **MSW** ("msw@2"). Setup at "src/test/setup.ts" auto-starts MSW before all tests ("server.listen"). Worker at "public/mockServiceWorker.js".
- Test files: "src/**/*.test.{ts,tsx}" for frontend, "server/src/**/*.test.ts" for backend
- MSW configured with "onUnhandledRequest: 'bypass'" — won't fail on unhandled requests
- Mock mode flag "__USE_MOCK__" exists for backward compat but is **always "false"** in production

## TypeScript quirks

| Setting | Impact |
|---------|--------|
| "verbatimModuleSyntax: true" | Must use "import type" for type-only imports |
| "exactOptionalPropertyTypes: true" | Cannot assign "undefined" to optional properties |
| "noUncheckedIndexedAccess: true" | Index access returns "T \| undefined" |
| "noPropertyAccessFromIndexSignature: true" | Must use bracket notation for index signatures |
| "erasableSyntaxOnly: true" (node tsconfig) | No enums with initializers in node config |
| "noImplicitOverride: true" | Must use "override" keyword |

## ESLint

- Flat config ("eslint.config.js"), ESLint 10 compatible
- Frontend/backend lint split:
  - Frontend: "src/**/*.{ts,tsx}"
  - Backend: "server/src/**/*.ts"
- Uses:
  - "@eslint/js"
  - "typescript-eslint"
  - "eslint-plugin-react"
  - "eslint-plugin-react-hooks"
  - "eslint-plugin-react-refresh"
  - "eslint-plugin-unused-imports"
  - "eslint-plugin-import"
- Type-aware linting enabled via:
  - "typescript-eslint strictTypeChecked"
  - "parserOptions.project = true"
- React hooks validation enabled via:
  - "react-hooks recommended rules"
- Architectural protections:
  - Prevent direct "httpClient" imports outside API modules
  - Detect import cycles
  - Detect duplicate imports
- Async safety rules enabled:
  - "no-floating-promises"
  - "await-thenable"
  - "no-misused-promises"
- Key rules:
  - "no-console": warn ("warn", "error" allowed)
  - "unused-imports/no-unused-imports": error
  - "@typescript-eslint/no-explicit-any": error
  - "@typescript-eslint/no-unused-vars": warn (ignore "_" prefix)
  - "@typescript-eslint/consistent-type-imports": error
- Ignored:
  - "dist/"
  - "node_modules/"
  - "drizzle/"
  - "*.config.*"
  - "scripts/"
  - ".opencode/"
  - ".roo/"
  - ".windsurf/"
  - "coverage/"
  - "*.d.ts"
- Goals:
  - Prevent architectural bypasses
  - Enforce HTTP layer consistency
  - Reduce dead code
  - Improve async safety
  - Prevent circular dependencies
  - Strengthen type integrity

## Proibições

É expressamente proibido:
- desabilitar regras
- reduzir severidade
- adicionar ignores
- usar "eslint-disable"
- usar "@ts-ignore"
- usar "@ts-expect-error"
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

- Schema entrypoint: "server/src/db/schema/index.ts" (re-exports from sub-modules)
- ORM plugin in opencode: "flux_sync_db_schema" auto-generates + applies migrations when schema changes
- ⚠ "drizzle-kit migrate" and any "drop" command require explicit user approval (opencode.json permissions)

## Required env vars (copy ".env.example" → ".env")

| Var | Purpose |
|-----|---------|
| "DATABASE_URL" | PostgreSQL connection string |
| "JWT_SECRET" | HMAC secret for JWT tokens |
| "CORS_ORIGINS" | Comma-separated allowed origins |

## openCode integrations

- **Plugin**: ".opencode/plugins/flux-delivery-tools.ts" — 3 tools: "flux_sync_db_schema" (generate+migrate), "flux_create_feature_module" (scaffold profile module), "flux_validate_project" (lint + build)
- **MCP**: Stitch (Google UI gen), Context7 (docs), Playwright (E2E), shadcn-ui (components)
- **Instruct files**: ".opencode/ag-kit-main/AGENT_FLOW.md" loaded alongside this file

## Key conventions

- **Route code-splitting**: Every page is lazy-loaded via "React.lazy(() => import('./pages/...'))" in "App.tsx"
- **Tailwind**: v4 CSS-first config ("@tailwindcss/postcss" plugin, no "tailwind.config.js"), "tailwind-variants" for component variants
- **Toast**: Sonner via "<Toaster/>" in "ToastProvider"
- **Modules**: Feature modules in "src/modules/" by profile: "auth/", "merchant/", "admin/", "saas/", "superadmin/", "courier/", "enterprise/", "experience/"
- **"@hono/zod-validator"**: Used in all backend route validation
- **"concurrently"**: "npm run dev" uses "concurrently -n client,server" for parallel dev servers

## Correções proibidas

É proibido corrigir erros através de:
- casting inseguro ("as any", "as unknown as")
- non-null assertion ("!")
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

- toda chamada HTTP deve passar pela camada "api/"
- "useQuery" e "useMutation" devem estar isolados em hooks
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

> [!important]
> Toda alteração deve seguir:
> 1. alterar código;
> 2. executar lint;
> 3. executar typecheck;
> 4. executar testes afetados;
> 5. validar build;
> 6. somente então concluir tarefa.

> [!danger]
> É proibido declarar sucesso sem validação executada.

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

## Obsidian Vault — Sistema de Memória Operacional

O diretório do projeto ("C:\PROJETO NODE_JS\clone") É o vault do Obsidian. [[Vault Index|Acessar índice do vault]]. Esta seção é o guia central para o [[MOC Obsidian System]].

### Bootstrap obrigatório antes de qualquer tarefa

Sempre ler estes arquivos antes de executar qualquer tarefa:

1. `AGENTS.md`
2. `docs/obsidian/_index.md`
3. `docs/obsidian/CURRENT_STATE.md`
4. `docs/obsidian/MEMORY.md`
5. `docs/obsidian/system/SEMANTIC_INDEX.md`
6. `docs/obsidian/system/GRAPH_HEALTH.md`
7. `.opencode/ag-kit-main/AGENT_FLOW.md`

`docs/index.md` foi substituído pelo índice operacional `docs/obsidian/_index.md` e pela documentação técnica temática em `docs/guides/`, `docs/architecture/`, `docs/api/`, `docs/database/` e `docs/testing/`.

Execução sem carregar os arquivos obrigatórios é proibida. Se qualquer arquivo obrigatório estiver ausente, desatualizado ou inconsistente:

1. STOP-WORK.
2. Reportar a inconsistência explicitamente.
3. Propor sincronização/regeneração via `flux_validate_project` ou `flux_sync_db_schema`, quando aplicável.

### Estrutura obrigatória

```
docs/
├── obsidian/          # Memória operacional, RAG, MOCs, worklogs e ADRs
│   ├── _index.md
│   ├── MEMORY.md
│   ├── CURRENT_STATE.md
│   ├── knowledge/
│   │   └── _index.md
│   ├── worklog/
│   │   └── _index.md
│   ├── adr/
│   │   └── _index.md
│   ├── mocs/
│   │   ├── _index.md
│   │   ├── MOC Architecture.md
│   │   ├── MOC Frontend.md
│   │   ├── MOC Backend.md
│   │   ├── MOC Auth.md
│   │   ├── MOC Delivery Flow.md
│   │   ├── MOC Database.md
│   │   ├── MOC Testing.md
│   │   ├── MOC Addons.md
│   │   ├── MOC SaaS.md
│   │   ├── MOC Merchant.md
│   │   ├── MOC Courier.md
│   │   ├── MOC Admin.md
│   │   ├── MOC SuperAdmin.md
│   │   ├── MOC RAG.md
│   │   └── MOC Obsidian System.md
│   ├── archive/
│   │   └── _index.md
│   └── system/
│       ├── _index.md
│       ├── SEMANTIC_INDEX.md
│       ├── GRAPH_HEALTH.md
│       ├── RETRIEVAL_RULES.md
│       ├── VECTOR_SEARCH.md
│       ├── MEMORY_LIFECYCLE.md
│       ├── SEMANTIC_SCORING.md
│       ├── ORPHAN_REPORT.md
│       ├── KNOWLEDGE_DECAY.md
│       └── AUTO_LINKING.md
├── guides/            # Guias técnicos para humanos
├── architecture/      # Documentação técnica arquitetural estática
├── api/               # Referência e rotas de API
├── database/          # Documentação de schema, migrations e providers
├── testing/           # Estratégia e padrões de teste
├── assets/            # Imagens e binários de documentação
└── sources/           # Fontes brutas/imutáveis, specs e auditorias
```

Separação obrigatória:

- `docs/obsidian/` é a camada de memória operacional e semântica. Deve conter notas de continuidade, knowledge notes, worklogs, ADRs, MOCs, índices e sistema RAG.
- `docs/guides/`, `docs/architecture/`, `docs/api/`, `docs/database/` e `docs/testing/` são documentação técnica tradicional.
- `docs/sources/` contém fontes brutas e deve ser tratado como imutável por padrão.
- `docs/assets/` contém mídia e não deve ser tratado como nota semântica.
- Notas de componentes geradas para grafo/RAG devem residir em `docs/obsidian/knowledge/components/`.

Ao criar ou editar notas no Obsidian, carregar obrigatoriamente as skills:

- `obsidian-cli` — analisar vault, mover arquivos, validar estrutura, detectar orphan notes, atualizar índices, backlinks e MOCs.
- `obsidian-markdown` — corrigir sintaxe Obsidian, frontmatter YAML, wikilinks, callouts, aliases e compatibilidade Markdown.
- `defuddle` — limpar conteúdo redundante, reduzir boilerplate, otimizar semantic density, token economy e compatibilidade RAG.

Essa regra se aplica a qualquer criação, atualização, reorganização, indexação, limpeza, importação ou validação de arquivos em `docs/obsidian/` e demais notas Markdown tratadas como parte do vault. Execução sem carregar essas três skills é proibida.

> [!warning]
> AGENTS.md é o arquivo de instruções principal do agente. Alterações devem ser feitas com cautela para não quebrar a continuidade operacional.

### Regras operacionais

1. **Nunca deletar notas automaticamente.** Mover para "archive/".

2. **Metadata obrigatório** em toda nota criada:
```md
---
type: knowledge|worklog|adr|state|memory
status: active|idle|concluded|archived
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
related: [arquivos relacionados]
supersedes: [nota substituída, se aplicável]
---
```

3. **Auto-indexação** — toda nota nova deve ser registrada no "_index.md" do diretório correspondente.

4. **Trimagem segura** (apenas via archive, nunca delete):
   - Worklogs fechados >30 dias → "archive/"
   - Notas superseded → "archive/"
   - Manter apenas últimas notas ativas no diretório principal

### CURRENT_STATE.md

Deve conter:
- fase atual
- último commit válido
- comandos de validação
- bloqueios
- próximo passo
- status geral (frontend, backend, testes, lint, build)

### MEMORY.md

Deve permanecer enxuto:
- apenas estado atual
- progresso consolidado
- sem logs longos

### Quando criar ADRs (architectural decision records)

Criar ADR automático em [[ADR Index]] quando houver:
- mudança arquitetural (L1-L6)
- troca de provider (ex: postgres ↔ memory)
- alteração de autenticação
- mudança de persistência
- qualquer decisão L1-L6

### Proibição de notas excessivas

Só criar notas para:
- fases
- bugs complexos
- decisões
- investigações
- incidentes
- arquitetura

### Recuperação de sessão interrompida

No início de cada sessão:
1. Ler [[CURRENT_STATE]] para verificar estado pendente
2. Ler [[MEMORY]] para contexto consolidado
3. Se [[CURRENT_STATE]] indicar task em andamento, perguntar: "Você tinha X em andamento (Fase N/M), quer continuar?"

> [!info] Versão estendida
> Consulte [[MEMORY_LIFECYCLE]] para o protocolo completo de session recovery avançado com semantic checkpoints, pending chains e active contexts.

## Crash-Safe Operational Memory

Sistema obrigatório de persistência operacional para garantir que tarefas longas sobrevivam a queda de energia, fechamento inesperado, crash do editor, crash do agente, interrupção da sessão ou reinício do computador.

### Estrutura obrigatória de recovery

```txt
docs/obsidian/worklog/
├── active/
│   └── CURRENT_TASK.md
├── checkpoints/
│   └── LAST_CHECKPOINT.md
└── recovery/
    ├── RECOVERY_QUEUE.md
    ├── PARTIAL_CHANGES.md
    └── ROLLBACK_STATE.md
```

### Quando ativar

Toda tarefa que altere código, tenha múltiplas etapas, dure mais de 5 minutos, modifique arquitetura, modifique múltiplos arquivos, execute refatoração, execute migração ou altere estado operacional DEVE usar este protocolo.

### Regras obrigatórias

Antes de iniciar a execução:

1. Criar ou atualizar `docs/obsidian/worklog/active/CURRENT_TASK.md`.
2. Criar checkpoint inicial em `docs/obsidian/worklog/checkpoints/LAST_CHECKPOINT.md`.
3. Registrar objetivo, arquivos alvo, estratégia, riscos e critérios de conclusão.
4. Registrar rollback possível e estado parcial seguro.

Durante a execução, após cada etapa:

1. Atualizar checkpoint.
2. Persistir progresso parcial.
3. Registrar arquivos alterados.
4. Registrar decisões intermediárias.
5. Registrar problemas encontrados.
6. Registrar pendências e próximo passo.

Ao concluir:

1. Validar integridade mínima.
2. Consolidar resultado em `MEMORY.md`, `CURRENT_STATE.md` ou worklog concluído, conforme relevância.
3. Remover a tarefa da fila ativa apenas depois da consolidação.
4. Preservar histórico em `worklog/`, nunca deletar automaticamente.

### Antes de executar alteração

Registrar em `CURRENT_TASK.md`:

- objetivo;
- arquivos alvo;
- estratégia;
- riscos;
- critérios de conclusão;
- comandos de validação esperados;
- estado de rollback.

### Durante execução

Após cada etapa, atualizar `LAST_CHECKPOINT.md` com:

- timestamp;
- fase atual;
- percentual de conclusão;
- arquivos afetados;
- decisões tomadas;
- pendências;
- riscos;
- próximo passo;
- estado parcial seguro.

Também atualizar:

- `PARTIAL_CHANGES.md` com alterações ainda não consolidadas;
- `RECOVERY_QUEUE.md` com tarefas interrompíveis;
- `ROLLBACK_STATE.md` antes de mudanças destrutivas, migrations, refatorações grandes, mudanças arquiteturais ou mudanças cross-module.

### Após crash ou reinício

No início da sessão o agente DEVE ler:

1. `docs/obsidian/CURRENT_STATE.md`
2. `docs/obsidian/MEMORY.md`
3. `docs/obsidian/worklog/active/CURRENT_TASK.md`
4. `docs/obsidian/worklog/checkpoints/LAST_CHECKPOINT.md`
5. `docs/obsidian/worklog/recovery/RECOVERY_QUEUE.md`

Depois deve detectar:

- tarefas interrompidas;
- alterações parciais;
- arquivos incompletos;
- refatorações interrompidas;
- migrations incompletas;
- estado operacional inconsistente.

Se houver tarefa ativa ou checkpoint pendente, perguntar:

> Foi detectada uma execução interrompida. Deseja continuar do checkpoint?

### Recovery safety

Após retomada, antes de continuar:

1. Validar integridade dos arquivos modificados.
2. Validar TypeScript quando houver código afetado.
3. Validar imports quando houver módulos afetados.
4. Validar build parcial quando aplicável.
5. Validar consistência arquitetural.
6. Continuar apenas após integridade mínima.

### Semantic checkpoints

Cada checkpoint deve conter frontmatter neste formato:

```md
---
type: semantic-checkpoint
status: active
task_id:
phase:
timestamp:
affected_files:
completion:
rollback_available:
---
```

Conteúdo obrigatório:

- objetivo atual;
- progresso;
- decisões tomadas;
- pendências;
- próximos passos;
- riscos;
- estado parcial seguro.

### Regras de integridade

- Nunca assumir conclusão sem validação.
- Nunca deixar estado parcialmente desconhecido.
- Nunca sobrescrever checkpoint sem consolidar anterior.
- Toda alteração parcial deve ser rastreável.
- Toda etapa deve possuir timestamp.
- Toda etapa deve possuir lista de arquivos afetados.
- Persistência é obrigatória antes de alterações destrutivas, refatorações grandes, migrations, mudanças arquiteturais, mudanças cross-module e após cada milestone.

### Critério de recuperação

O agente deve ser capaz de:

- continuar exatamente do ponto anterior;
- identificar arquivos incompletos;
- identificar estado inconsistente;
- reconstruir contexto sem depender do histórico do chat.

### Compatibilidade

Este protocolo deve permanecer compatível com Obsidian Graph, semantic retrieval, RAG, vector search, session recovery e persistent AI memory.

### Workflow de execução (multi-passo, >30 min ou >2 fases)

1. Planejar fases mentalmente (sem criar nota ainda).
2. Atualizar [[CURRENT_STATE]] e [[MEMORY]] com o plano.
3. Executar cada fase. Após cada uma, atualizar [[CURRENT_STATE]] e [[MEMORY]].
4. Ao concluir 100%:
   - Se relevante: criar nota em "worklog/" ou "knowledge/" com resumo + validação
   - Registrar no "_index.md" apropriado
   - Se for decisão arquitetural: criar ADR em "adr/"
   - Limpar [[CURRENT_STATE]] (voltar a estado idle)
   - Consolidar [[MEMORY]] (manter apenas progresso relevante)

### Tarefas simples (único passo, < 30 min)

- Não criar nota, não alterar memória.
- O git já registra o que foi feito.

### Sistema semântico

Toda a persistência semântica, RAG, taxonomia, scoring e regras de integridade do vault foram modularizadas em `docs/obsidian/system/`. Consulte:

| Nota | Conteúdo |
|------|----------|
| [[system/_index\|System Index]] | Índice completo do sistema semântico |
| [[SEMANTIC_INDEX]] | Taxonomia oficial de tags, MOCs (regras formais + metadata + workflow), AI Operational Memory Layer, metadata expandido, hubs semânticos |
| [[GRAPH_HEALTH]] | Integridade do grafo semântico, métricas de conectividade, auditoria do vault, orphan rules |
| [[RETRIEVAL_RULES]] | Compatibilidade com IA/RAG, RAG-safe architecture, Defuddle integration, chunking, ranking, embeddings |
| [[VECTOR_SEARCH]] | Embeddings, busca vetorial, retrieval pipeline híbrido |
| [[MEMORY_LIFECYCLE]] | Memory lifecycle (temporary → operational → permanent → archived), session recovery avançado, retention policy |
| [[SEMANTIC_SCORING]] | Fórmulas de score semântico, política de notas, density/authority/backlink scoring |
| [[ORPHAN_REPORT]] | Detecção e reconexão de notas órfãs |
| [[KNOWLEDGE_DECAY]] | Política de envelhecimento, archive triggers, review intervals |
| [[AUTO_LINKING]] | Regras de linking, anti-artificial-linking, semantic density preservation |
