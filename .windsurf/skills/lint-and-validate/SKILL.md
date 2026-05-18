---
name: lint-and-validate
description: Validacao obrigatoria apos toda modificacao de codigo. Alinhado ao SEC-12 (COMPLIANCE CHECK), invariante PI (WRITE PIPELINE) e camada L6 (INTEGRIDADE). Triggers onKeywords: lint, format, check, validate, types, static analysis, compliance, safe-write.
allowed-tools: Read, Glob, Grep, Bash
---

# Lint and Validate Skill

> **MANDATORIO:** Executar validacao apos TODA modificacao de codigo. Nenhuma tarefa e considerada concluida sem passar nos checks.

## Pipeline obrigatoria (SEC-12 COMPLIANCE CHECK)

Todo write/edit DEVE seguir esta ordem conforme system-contract SEC-12:

1. Validar invariantes (SEC-10: OMEGA, PSI, LAMBDA, GAMMA, XI, SIGMA, PI, THETA, KAPPA, DELTA, RHO, OMEGA2, IOTA, PHI)
2. Validar snapshot ativo (hash, lease, epoch)
3. Executar `safe-write`
4. Rodar formatter e lint
5. Rodar typecheck
6. Verificar CAS para consolidacao de memoria compartilhada
7. Registrar operacao no WAL
8. Propagar trace_id/span_id no log
9. Prosseguir apenas se tudo passar

## Comandos do projeto

### Lint e formatacao (Biome)

```bash
bun run lint          # biome check (lint + format)
bun run check         # alias para biome check
bun run format        # biome format --write (aplica formatacao)
```

### Typecheck

```bash
bun run typecheck     # tsc -b --noEmit (verificacao de tipos)
bun run typecheck:refs # tsc -b tsconfig.build.json --noEmit
```

### Validacao arquitetural (L6 - INTEGRIDADE)

```bash
bun run validate:arch     # validacao L1-L6 via regex
bun run validate:runtime  # validacao via TypeScript AST
bun run validate:semantic # validacao semantica L1-L6
bun run validate:coverage # cobertura de regras do contrato
bun run validate:all      # safe-write + arch + coverage + typecheck
```

### Safe-write (invariante PI)

```bash
bun run safe-write    # pipeline obrigatoria antes de todo write
```

### Build e CI

```bash
bun run build         # validate:all + lint + build:next
bun run ci:verify     # lint + build:next + test (pipeline de integridade L6)
bun run test          # vitest run (testes unitarios)
```

## The Quality Loop

1. **Write/Edit Code** (via safe-write)
2. **Run Lint:** `bun run lint`
3. **Run Typecheck:** `bun run typecheck`
4. **Analyze Report:** Se houver falhas, corrigir imediatamente
5. **Fix & Repeat:** Submeter codigo com falhas NAO e permitido

## Error Handling

- Se `bun run lint` falhar: corrigir estilo ou sintaxe imediatamente
- Se `bun run typecheck` falhar: corrigir tipagem antes de prosseguir
- Se `bun run validate:arch` falhar: violacao arquitetural — nao prosseguir sem resolver
- Se `bun run safe-write` falhar: violacao do pipeline de escrita (PI) — STOP-WORK
- Se `bun run test` falhar: corrigir testes antes de reportar conclusao

## Guardas criticos (SEC-10 INVARIANTES)

Antes de qualquer write, verificar:

- zero `any` (RT-05)
- rota hardcoded apenas em `src/lib/routes.ts` (RT-06)
- arquivo <= 300 linhas (LAMBDA)
- imports respeitam isolamento de camadas L1-L6 (RT-10)
- nenhum import cruzado entre bounded contexts (SEC-07)

## Regra estrita

Nenhum codigo deve ser reportado como "done" sem passar por:

```bash
bun run lint && bun run typecheck
```

Para tarefas arquiteturais ou compliance, adicionar:

```bash
bun run validate:all
```
