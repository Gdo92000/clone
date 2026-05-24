---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/architecture
---

# Visão Geral do Projeto — Flux Delivery

## O que é
Multi-profile **delivery SaaS** com cinco perfis: Cliente, Merchants, Admin, Superadmin, Courier.

## Stack principal
| Camada | Tech |
|---|---|
| Frontend | React 19 + Vite 8 + Tailwind CSS 4 + TanStack Router/Query |
| Backend | Hono 4 + `@hono/node-server` + Drizzle ORM 0.45 + Zod 4 |
| DB | PostgreSQL (Supabase) + modo `memory` para testes |
| Auth | JWT HS256 (`@hono/jwt`) + bcryptjs + refresh tokens |
| Testes | Vitest (dual project: node + jsdom) + MSW 2 |

## Comandos rápidos
```bash
npm install
npm run dev           # frontend + backend concurrently
npm run dev:client    # Vite port 5173
npm run dev:server    # Hono port 3001
npm run build         # tsc -b && vite build
npm run lint          # ESLint flat config
npm test              # vitest interactive
npm run test:run      # single-pass
npm run test:coverage # v8 coverage
```

## Estrutura de pastas
```
server/src/
  db/            drizzle schema + provider + registry (postgres ↔ memory)
  routes/        Hono routers por funcionalidade
  ports/         RepositoryPort / Filter / TransactionPort interfaces
  lib/           environmentRuntime, health checks
  __tests__/     server-side testes
shared/
  validations/   Zod schemas compartilhados backend ↔ frontend/MSW
src/
  hooks/         Custom React hooks
  services/      Frontend services (HTTP via api/ layer)
packages/
  tokens/        @fluxds/tokens — atomic tokens
ui/ @fluxds/ui — componentes React
```

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[MOC — Perfis do Sistema]]
