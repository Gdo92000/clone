# Development

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia frontend + servidor em paralelo |
| `npm run dev:client` | Apenas frontend (Vite) |
| `npm run dev:server` | Apenas servidor (tsx watch) |
| `npm run build` | Type check + build de produção |
| `npm run lint` | ESLint em todo o projeto |
| `npm run preview` | Preview do build |
| `npm run db:generate` | Gerar migrations Drizzle |
| `npm run db:migrate` | Aplicar migrations |
| `npm run db:studio` | Drizzle Studio (GUI do banco) |

## Estrutura de Desenvolvimento

### Frontend

- **Lazy loading**: todas as páginas usam `React.lazy()` + `Suspense`
- **React Compiler**: habilitado via babel-plugin-react-compiler (melhora performance de re-renders)
- **Tipagem estrita**: TypeScript 6.x configurado com `strict: true`
- **React Query**: cache configurado com `gcTime: 5min`, `staleTime: 5min` (dados comuns) ou `10min` (categorias)

#### Adicionar uma nova página
1. Criar componente em `src/pages/` ou `src/modules/{area}/pages/`
2. Adicionar rota em `src/lib/routes.ts`
3. Importar lazy em `src/App.tsx`
4. Adicionar `<Route>` no componente `App`

#### Adicionar um novo módulo
1. Criar diretório em `src/modules/{nome}/`
2. Estrutura sugerida: `pages/`, `components/`, `data/` (se necessário)
3. Registrar rotas em `src/lib/routes.ts` e `src/App.tsx`

### Backend

- **Server**: Hono rodando com `@hono/node-server`
- **Hot reload**: tsx watch recarrega automaticamente
- **Validação**: Zod schemas em `shared/validations/` validados via `@hono/zod-validator`
- **Database**: Drizzle ORM + postgres.js
- **Error handling**: `AppError` class + `errorHandler` global

#### Adicionar uma nova rota
1. Criar arquivo em `server/src/routes/`
2. Definir schema Zod em `shared/validations/` (se necessário)
3. Importar e registrar em `server/src/index.ts`

#### Adicionar uma nova tabela
1. Criar schema em `server/src/db/schema/`
2. Exportar em `server/src/db/schema/index.ts`
3. Rodar `npm run db:generate` + `npm run db:migrate`

## Boas Práticas

### Código
- Sem `any` — TypeScript strict
- Sem fallback hardcoded (`?? false`, `|| false`, default "Fechado")
- Estados de loading/error/empty explícitos (nunca mascarar ausência de dados)
- React Query para fetching de dados (não fetch/axios direto em componentes)
- Hooks de repositório para lógica de dados (padrão Repository)

### Estilo
- Tailwind CSS 4 (CSS-first)
- tailwind-variants para variantes de componentes
- tailwind-merge para merge de classes

### Backend
- Validar params com Zod em todas as rotas
- Usar `max()` constraints nos schemas Zod
- Erros padronizados via AppError
- JWT obrigatório em produção
