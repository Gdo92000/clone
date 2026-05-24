---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/architecture
---

# Arquitetura de Camadas (L1–L6)

## Princípio
Todo o fluxo do sistema é organizado em **6 camadas**, cada uma com sua responsabilidade única.

## Visão

```
L6  Router/UI         → React Router + componentes
L5  Hooks/Hooks       → useQuery, useMutation orquestadores
L4  Services/Front    → Chamadas HTTP via api/ layer
L3  API Layer         → Zod validate → Router → Repos (backend)
L2  Domain           → RepositoryPort, EntityStore, Contracts
L1  Infra            → DB, Config, Telemetry, Replay
```

## Regras

- `L4` nunca acessa `L1` diretamente
- `L3` é a única camada que usa `Registry`
- `L2` define contratos; `L1` implementa

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[ARCHITECTURE]]
