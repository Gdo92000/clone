---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-06-08
tags:
  - type/knowledge
  - domain/architecture
---

# Decisões Arquiteturais

## 1. Monorepo sem Workspaces

Frontend e backend no mesmo repo, **não** linkados via npm workspaces. Packages locais (`packages/tokens`, `packages/ui`) referenciados via imports relativos. Único `package-lock.json` gerencia todas as dependências.

→ Ver também: [[Packages Locais]]

## 2. Vite Proxy para API Routing

Vite dev server faz proxy de todos os `/api/*` para o backend, eliminando CORS em dev e unificando a superfície de API.

→ Ver também: [[Middlewares e Segurança]]

## 3. Dupla Autorização: Roles + Permissions

`requirePermission()` suporta roles legados (`superadmin`, `admin`, etc.) E permissões granulares via tabela `rolePermissions`. Superadmin bypassa tudo. Frontend replica via `ProtectedRoute` para UX, mas backend é source of truth.

→ Ver também: [[Middlewares e Segurança]] · [[Authentication Flow]]

## 4. Feature Capability SaaS Model

Sistema completo de capacidades SaaS: plans (`basic`/`pro`/`premium`) + addons + feature flags + billing status.

→ Ver também: [[SaaS Capability System]]

## 5. Shared Zod Schemas

Schemas em `shared/validations/` importados por frontend e backend, garantindo validação consistente para address, restaurant e operations.

→ Ver também: [[Repository Ports & Schemas]]

## 6. Auth Provider Strategy Pattern

Interface `AuthProvider` abstrai lógica de autenticação. Apenas `local` (bcryptjs + JWT) implementado, mas arquitetura suporta `supabase` ou outros providers.

→ Ver também: [[Authentication Flow]]

## 7. Domain-Layered Database Schema

Schema Drizzle organizado por domínio (`core`, `customer`, `merchant`, `commerce`, `saas`, `operations`, `ops`) ao invés de por preocupação técnica. Cada diretório de domínio tem seu próprio `index.ts` para exports e `relations.ts` para relações Drizzle.

→ Ver também: [[Arquitetura de Dados]] · [[DATABASE]]

## 8. Prometheus Metrics

Middleware rastreia request count, duration, errors e active requests via `prom-client`. Paths normalizados (UUIDs → `:uuid`). Exposto em `GET /api/metrics`.

→ Ver também: [[Error Handling e Performance]]

## 9. Graceful Shutdown

Server lida com `SIGTERM`/`SIGINT`: verifica DB connectivity (503 se down), fecha HTTP server, força exit após 10s timeout.

→ Ver também: [[Error Handling e Performance]]

## 10. Otimizações de Performance

Code splitting (lazy loading), bundle chunking (manualChunks), React Query caching (2min stale / 5min GC), DB indexes por domínio, rate limiting configurável com suporte Redis.

→ Ver também: [[Error Handling e Performance]]

## 11. Mirror Service — Transação Atômica (ADR-005)

Pedidos consumer e merchant são criados em 2 schemas do banco (`customer.orders` + `merchant.merchant_orders`). A operação DEVE ser atômica via `db.transaction` — sequential inserts produzem gravação parcial em 6 cenários de falha. `orders` é source of truth; `merchant_orders` é view derivada com mesmo `id`.

→ Ver também: [[ADR-005 Mirror Service Atomicidade e Integridade]] · [[Mirror Service — Arquitetura e Auditoria]]

## 12. Fallback em Lookup de Negócio = Erro Explícito

`findBranchForRestaurant` e funções similares de lookup de negócio **NÃO devem retornar fallback** (primeira branch, default, etc.). Se o registro não existe, lançar erro explícito (ex: `BRANCH_NOT_FOUND`). Fallback silencioso atribui dados à entidade errada sem sinalização.

→ Ver também: [[ADR-005 Mirror Service Atomicidade e Integridade]]

## 13. Tipos Concretos > Genéricos no Schema DB (ADR-006)

`RepositoryPort` e `BasePostgresRepository` usam `PgTable` concreto (não `TTable extends PgTable`) + `Record<string, unknown>` para dados. Trade-off: perde inferência de tipo de entidade, mas elimina `any` interno forçado pelo Drizzle v0.45+.

→ Ver também: [[ADR-006 PostgreSQL Concrete vs Generic Schema]]

## 14. Repository Pattern Obrigatório para Novos Módulos (ADR-008)

Novos módulos DEVEM usar `RepositoryPort` + `BasePostgresRepository` + `BaseMemoryRepository`. Serviços legados (11 arquivos) que importam `db` diretamente permanecem sem refatoração retroativa — apenas sob gatilho (troca de ORM, bug, feature request).

→ Ver também: [[ADR-008 Repository Pattern para novos módulos]]

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[ARCHITECTURE]]
