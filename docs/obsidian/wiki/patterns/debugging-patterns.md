---
type: pattern
status: active
domain: engineering
layer: L3
created_at: 2026-06-02
updated_at: 2026-06-02
tags:
  - debugging
  - troubleshooting
  - logs
---

# Debugging Patterns

## Quando aplicar

- Bug reportado sem causa obvia
- Test suite falhando intermitentemente
- Diferenca de comportamento entre dev/prod
- Memory mode (backend in-memory) retornando dados inesperados

## Decisoes canonicas

- **Reproduzir primeiro**: antes de teorizar, isolar o caso minimo. Cria um teste que falha.
- **Ler logs do server, nao so do browser**: `server_log.txt` tem stack traces; `contexto.txt` tem estado consolidado.
- **Checar `service-provider/`**: 80% dos bugs DEV/PROD sao provider errado. Validar que `DATABASE_PROVIDER` esta consistente.
- **Memory mode para isolamento**: `DATABASE_PROVIDER=memory npm test` evita acoplamento com banco real e zera estado entre tests.
- **Bisect por capability**: usar manifests de `frontend`/`backend` para carregar so o contexto relevante ao bug.

## Anti-padroes

- `console.log` espalhado sem remocao pos-debug (deixar no codigo = ruido permanente)
- Teorizar causa antes de reproduzir (leva a fix errado)
- Debugar em prod (usar staging ou repro local primeiro)
- Ignorar `git status` antes de bisect (mudancas locais confundem o diagnostico)

## Onde aprofundar

- `docs/obsidian/project-operating-system/03-ENGINEERING/CODE_STANDARDS.md`
- `docs/obsidian/project-operating-system/03-ENGINEERING/BUG_REPORT_TEMPLATE.md`
- `docs/obsidian/wiki/patterns/error-handling-patterns.md`
- `audit-results/` (auditorias previas com mesma classe de bug)
