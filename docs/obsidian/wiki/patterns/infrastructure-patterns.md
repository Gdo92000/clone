---
type: pattern
status: active
domain: infrastructure
layer: L3
created_at: 2026-06-02
updated_at: 2026-06-02
tags:
  - infrastructure
  - dev-prod-parity
  - service-container
---

# Infrastructure Patterns

## Quando aplicar

- Adicionar novo servico de infra (DB, cache, queue, storage)
- Diagnosticar diferenca dev/prod
- Decidir entre mock/in-memory ou servico real em tests

## Decisoes canonicas

- **ServiceProvider e a unica porta de entrada**: `infrastructure/service-provider/` expoe factories. Codigo de feature nunca importa implementacao concreta.
- **Reset deterministico entre tests**: `infrastructure/test-helpers/` expoe `resetServiceProvider()` que zera todos os singletons. Chamado em `beforeEach` de suites E2E.
- **Env vars validadas no boot**: `server/src/config/env.ts` faz parse+validate. Faltar = startup falha, nao runtime.
- **DATABASE_PROVIDER com default seguro**: `memory` em test, `postgres` em prod. Nunca defaultar a `postgres` em dev (acopla a infra local).
- **Container reset em dev**: `npm run dev:reset` limpa estado do service-provider. Necessario apos mudar schema.

## Anti-padroes

- Singleton global importado direto (`import { db } from './db'` sem factory)
- Estado compartilhado entre tests sem reset (test pollution)
- Hard-coded URL/porta em codigo de feature (deve vir de config)
- Mocks que divergem sutilmente do real (pegar em CI mas quebrar em prod)

## Onde aprofundar

- `docs/obsidian/project-operating-system/02-ARCHITECTURE/DECISION_LOG.md` (ADRs de service-provider)
- `audit-results/abstraction-layer-parity.md` (10 gaps, **CLOSED 2026-06-02**)
- `docs/obsidian/wiki/patterns/deployment-patterns.md` (CI/CD)
- `server/src/infrastructure/service-provider/`
