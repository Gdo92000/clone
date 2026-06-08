---
type: pattern
status: active
domain: architecture
layer: L3
created_at: 2026-06-02
updated_at: 2026-06-02
tags:
  - database
  - service-provider
  - repository
---

# Database Patterns

## Quando aplicar

- Adicionar nova entidade/tabela em `drizzle/`
- Trocar provider (memory <-> postgres) em dev/prod
- Decidir se um servico deve ser API-based ou repository-based

## Decisoes canonicas

- **DATABASE_PROVIDER env var**: `memory` (dev/test, in-memory) ou `postgres` (prod). Lido em `server/src/infrastructure/`.
- **ServiceProvider**: unica entrada para obter repository concreto. Service NAO importa `*Memory` ou `*Postgres` diretamente.
- **Soft delete obrigatorio**: campo `deleted_at` (nullable timestamp). Hard delete proibido para entidades de dominio (User, Order, etc).
- **Drizzle ORM como fonte**: schema em `drizzle/schema/*.ts`. Migrations geradas via `drizzle-kit generate`.
- **Admin/Superadmin permanecem API-based** (sem repository): Services orquestram multiplos endpoints HTTP do server; AdminService/SuperadminService NAO usam `IAdminRepository/ISuperadminRepository` (repos foram removidos em 2026-06-02, ver `dev-prod-parity` phase).

## Anti-padroes

- Service importa `UserRepositoryMemory` direto (acopla ao provider; deve ir via ServiceProvider)
- Repository que retorna entity crua vs DTO sem discriminacao (sempre retornar DTO mapeado)
- Migration manual fora de `drizzle-kit` (drift entre schema e banco)

## Onde aprofundar

- `docs/obsidian/project-operating-system/02-ARCHITECTURE/DECISION_LOG.md` (ADRs de provider)
- `docs/obsidian/wiki/patterns/architecture-patterns.md` (camadas)
- `audit-results/abstraction-layer-parity.md` (gaps DEV/PROD)
- `server/src/infrastructure/service-provider/`
