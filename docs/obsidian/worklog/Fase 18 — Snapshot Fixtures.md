---
type: worklog
status: concluded
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
 - type/worklog
---

# Fase 18 — Snapshot Fixtures

## Propósito
Arquitetura de fixtures determinísticas para testes — serializador, snapshots de registry e loader de fixtures.

- **Serializer** normaliza datas e filtros não-serializáveis
- **Registry shots** capturam estado completo dos stores `memory` em ponto no tempo
- **Fixture loader** carrega JSON pré-definido nos stores antes de suítes de teste

## Arquivos criados nesta fase

| Arquivo | Responsabilidade |
|---|---|
| `server/src/db/fixtures/serializer.ts` | Normaliza entity para JSON seguro |
| `server/src/db/fixtures/registry-shots.ts` | `snapshotRegistry()` + `restoreRegistry()` |
| `server/src/db/fixtures/loader.ts` | Carrega arquivos JSON em EntityStore |
| `server/__tests__/fixtures/*.test.ts` | Testes de serializer + shots |

## Estado

⏳ A implementar — passo a passo:

1. `fixtures/serializer.ts` — filter out funções, converter Date → ISO string
2. `fixtures/registry-shots.ts` — iterar todas as stores do registry, chamar snapshot()
3. `fixtures/loader.ts` — ler JSON, parsear, chamar restore() em cada repo
4. Testes unitários

## Próximas fases

- **FASE 19–21**: telemetry, chaos, replay (stubs existentes em `server/src/lib/`)
- **FASE 22**: retry/saga/delay provider
- **FASE 23**: IndexedDB offline persistence (frontend)

> [!tip] Navegação
> [[MOC — Histórico do Projeto]]
