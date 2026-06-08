---
type: pattern
status: active
domain: infrastructure
layer: L3
created_at: 2026-06-02
updated_at: 2026-06-02
tags:
  - deploy
  - ci-cd
  - migrations
---

# Deployment Patterns

## Quando aplicar

- Adicionar step novo no pipeline (build, test, deploy)
- Mudar configuracao de producao
- Aplicar migration de banco em prod
- Rollback de versao deployada

## Decisoes canonicas

- **Pre-commit hook obrigatorio**: `.githooks/pre-commit` valida memory:check + memory:lint + pos-test-all antes de aceitar commit. Bypass = ticket de incidente.
- **Migrations em transacao**: `drizzle-kit migrate` aplica em transacao por arquivo. Falha parcial = rollback automatico.
- **Health check em 2 niveis**: `/health` (liveness, sem deps) e `/ready` (readiness, pinga DB). K8s usa os 2 separadamente.
- **Build artifact versionado**: git SHA no nome do artefato (`app-abc1234.tar.gz`). Nunca `latest` em prod.
- **Deploy atomic**: para versao antiga antes de subir nova. Sem rolling update parcial entre versoes incompativeis.

## Anti-padroes

- Migration sem `IF NOT EXISTS` em hot path (causa lock contention)
- Deploy direto na main sem passar por staging
- Config de prod commitada no repo (deve estar em secret manager)
- `npm ci` em prod com lockfile desatualizado (drift entre dev/prod)

## Onde aprofundar

- `docs/obsidian/project-operating-system/03-ENGINEERING/CODE_STANDARDS.md`
- `docs/obsidian/wiki/patterns/infrastructure-patterns.md` (service-provider reset)
- `.githooks/pre-commit` (validador local)
- `scripts/pos/` (POS integrity suite)
