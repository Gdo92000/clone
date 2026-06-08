---
type: pattern
status: active
domain: architecture
layer: L3
created_at: 2026-06-02
updated_at: 2026-06-02
tags:
  - architecture
  - decisions
  - c4
---

# Architecture Patterns

## Quando aplicar

- Decidir estrutura de modulos novos (`src/`, `server/src/`)
- Avaliar adicao de novo servico, repositorio ou provider
- Planejar mudanca que cruza 2+ dominios

## Decisoes canonicas

- **C4 model obrigatorio**: contexto, containers, componentes, codigo. Diagramas em `02-ARCHITECTURE/C4_MODEL.md` sao a fonte de verdade para o "como o sistema se organiza".
- **Camadas frontend**: `components/` (apresentacao), `services/` (logica), `repositories/` (acesso a dados). Nunca pular camadas.
- **Camadas backend**: `routes/` → `services/` → `repositories/`. Services orquestram; repositories persistem.
- **Repository pattern para estado**: services NUNCA acessam `localStorage`/`IndexedDB`/HTTP direto. Sempre via repository.
- **ServiceProvider pattern**: `infrastructure/service-provider/` permite trocar implementacao (memory/postgres) sem tocar call sites.

## Anti-padroes

- Componente que faz fetch + UI + state global (mistura de camadas)
- Service backend que importa repository especifico de provider (acopla memory/postgres)
- Logica de negocio em `useEffect` (deve estar em hook custom ou service)

## Onde aprofundar

- `docs/obsidian/project-operating-system/02-ARCHITECTURE/C4_MODEL.md`
- `docs/obsidian/project-operating-system/02-ARCHITECTURE/DECISION_LOG.md`
- `docs/obsidian/project-operating-system/02-ARCHITECTURE/DATA_FLOW.md`
- `docs/obsidian/wiki/patterns/frontend-patterns.md`
