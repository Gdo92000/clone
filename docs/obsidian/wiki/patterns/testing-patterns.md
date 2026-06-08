---
type: pattern
status: active
domain: engineering
layer: L3
created_at: 2026-06-02
updated_at: 2026-06-02
tags:
  - testing
  - vitest
  - coverage
---

# Testing Patterns

## Quando aplicar

- Criar suite nova (unit, integration, E2E)
- Adicionar caso de borda a suite existente
- Decidir mock vs real em test E2E
- Diagnosticar test flake (passa 9/10 vezes)

## Decisoes canonicas

- **3 projects no vitest**: `server-routes` (HTTP layer), `server` (backend), `frontend` (componentes). Suite adicional `memory` para scripts em `scripts/memory/`.
- **Isolamento via backup/restore**: testes que mutam canonico (phases.jsonl) fazem `copyFileSync` em `beforeAll`/`afterAll`. Nunca mutar arquivo real.
- **Mock em unit, real em integration**: services testados com `vi.mock()` em unit, mas em integration tests usar `DATABASE_PROVIDER=memory` para o repo real.
- **Test names descrevem comportamento**: `it("rejeita id duplicado")` nao `it("test 1")`. Comportamento observavel, nao implementacao.
- **Coverage thresholds no CI**: branches >= 80%, functions >= 85%. Falha = bloqueia merge.

## Anti-padroes

- `it.only` esquecido em suite (mascarando falhas)
- Test que depende de ordem de execucao (outro test rodando antes)
- Sleep fixo (`setTimeout(1000)`) em vez de `waitFor` (causa flake)
- Mock de modulo inteiro quando so 1 funcao precisa de mock (`vi.mock` com factory)
- Coverage de 100% como meta (gera tests sem valor; prefira 80% com qualidade)

## Onde aprofundar

- `docs/obsidian/project-operating-system/09-TESTING/TEST_PLAN.md`
- `docs/obsidian/project-operating-system/03-ENGINEERING/CODE_STANDARDS.md`
- `docs/obsidian/wiki/patterns/architecture-patterns.md` (camadas testaveis)
- `vitest.config.ts`
