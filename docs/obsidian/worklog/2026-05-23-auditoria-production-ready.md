---
type: worklog
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
related:
  - MEMORY.md
  - CURRENT_STATE.md
  - ../../AGENTS.md
  - ../../eslint.config.js
tags:
 - type/worklog
---

# Auditoria Production-Ready

## Resumo

Auditoria completa de production-readiness em 6 domínios. 53 findings encontrados (10 críticos, 18 altos, 18 médios, 7 baixos).

## Auditorias realizadas

### 1. Segurança (15 findings: 3 altos, 6 médios, 4 baixos, 2 info)

- `src/services/authService.ts`: tokens JWT em localStorage (XSS-critical)
- `server/src/routes/auth.ts`: refresh token em corpo JSON (deveria ser cookie httpOnly)
- `server/src/index.ts`: CORS `origin: *` em produção
- `src/api/httpClient.ts`: token em header Authorization exposto em logs
- `server/src/middleware/auth.ts`: sem rate limit no refresh

### 2. Camadas L1-L6 (20 findings: 6 críticos, 8 altos, 4 médios, 2 baixos)

- Componentes UI (`FxNavbar`, `FxCartItem`, `FxImage`) importam services diretamente
- Páginas ignoram hooks e chamam API direto
- `api/index.ts` importa barrel root
- Módulos auth importam direct de api/
- Services acessam barrel root

### 3. Ciclos de dependência (11 findings, todos altos)

- Todos via `httpClient.ts` → `authService.ts` → `api/index.ts` → `httpClient.ts`
- Solução: separar token management do httpClient, httpClient não importar authService

### 4. Build/Bundle (3 findings: 1 alto, 2 médios)

- Leaflet 247KB chunk (alto)
- Tailwind CSS 190KB (~100KB excesso)
- 103 chunks JS, alguns muito pequenos (<1KB)
- 752KB carga inicial

### 5. React Runtime (23 findings: 3 críticos, 9 altos, 9 médios, 2 baixos)

| Severidade | Qtd | Principais problemas |
|------------|-----|----------------------|
| **Crítico** | 3 | 1 ErrorBoundary global (sem isolamento), 11 rotas públicas sem Suspense, useSaasWorkspace com setState em render |
| **Alto** | 9 | 3 context providers sem useMemo, 5 mutations sem onError, inline handlers generalizados |
| **Médio** | 9 | FxCartItem sem React.memo, logger usando console.warn para debug/info, ~120 FxQueryBoundary sem onRetry, sem window.onerror/unhandledrejection |
| **Baixo** | 2 | LoginPage eager load, telemetria usa console.warn |

### 6. Offline/Resiliência (7 findings: 1 crítico, 3 altos, 2 médios, 1 baixo)

- **Crítico**: 0 PWA (sem service worker, manifest, offline fallback)
- **Alto**: IndexedDB dead code (254 linhas não usadas), sem cache HTTP, sem persistência React Query
- **Médio**: SSE sem reconexão, cart volátil
- **Baixo**: Suspense fallback textual (sem skeleton)

## Lint

- Otimizado: timeout >120s → ~13s (com cache)
- 1148 erros totais (905 pré-existentes + 243 novos de testes type-aware)
- `eslint.config.js` atualizado: `projectService: true`, `maxDepth: 10`, resolver explícito

## Validação

| Comando | Resultado |
|---------|-----------|
| `npm run build` | ✅ Limpo (1.08MB) |
| `npm run lint` | ⚠️ 1148 erros (com cache) |
| `npm run test:run` | ✅ 242 testes |

## Próximos passos

1. Corrigir 3 itens críticos de segurança (token management)
2. Resolver 11 ciclos (separar token do httpClient)
3. Adicionar ErrorBoundary por seção
4. Adicionar Suspense nas rotas públicas
5. Corrigir render effects no useSaasWorkspace
6. useMemo nos context providers
7. Adicionar PWA baseline
8. onError nas mutations sem handler

> [!tip] Navegação
> [[MEMORY|Obsidian MEMORY]] · [[CURRENT_STATE]] · [[MOC — Histórico do Projeto]]
