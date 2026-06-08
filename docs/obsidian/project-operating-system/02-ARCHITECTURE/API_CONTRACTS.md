---
type: guide
status: template
domain: architecture
layer: L2
semantic_priority: 4
tags:
  - type/guide
  - domain/architecture
  - tech/api
  - lifecycle/template
  - retrieval_domain/architecture
  - context_temperature/warm
created_at: 2026-05-26
updated_at: 2026-05-26
---

# API_CONTRACTS — Contratos de API

Template para contratos de API entre serviços.

## Endpoints

| Endpoint | Método | Descrição | Auth |
|----------|--------|-----------|------|
| /api/health | GET | Health check | None |
| /api/auth/* | ALL | Auth endpoints | None |
| /api/agent/* | ALL | Agent endpoints | JWT |

## Schemas

### Request/Response Types

```typescript
interface HealthResponse {
  status: "healthy" | "degraded";
  version: string;
  uptime: number;
}
```

## Relações

- [[_index|02-ARCHITECTURE Index]]