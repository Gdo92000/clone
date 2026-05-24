---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/api
---

# Rotas da API — Backend

## Estrutura
```
server/src/routes/
  ├── auth.ts              /api/auth/login POST  /api/auth/me GET
  ├── routes.ts            agregador de todas as rotas v1
  ├── health.runtime.ts    /healthz /livez /readyz
  ├── restaurants.ts       CRUD restaurantes + busca por categoria
  ├── coverage-cities.ts   /api/coverage-cidades GET, POST
  ├── plans.ts             /api/plans lista + filtros
  ├── global-coupons.ts    /api/global-coupons (GET lista, POST criar)
  ├── currencies.ts        /api/currencies lista de moedas
  ├── enterprise.ts        /api/enterprise/config | health
  ├── sse.ts               /api/events SSE stream
  ├── orders.ts            /api/orders (criação, listagem, atualização de status)
  ├── merchants/           rotas por merchant (branch-settings, coupons, holidays, operations)
  ├── admin/               rotas de admin (users, reports, coverage)
  └── ...
```

## Padrão de rota
```typescript
app.get('/api/coverage-cities', async (c) => {
  // 1. Extrai tenant
  const tenantId = c.get('tenantId');
  // 2. Chama registry — sabe se está postgres ou memory
  const cities = await registry.repos.coverageCities.findMany(
    { where: { is_active: true } },
    tenantId,
  );
  // 3. Responde com Zod-schema garantido
  return c.json(cities, 200);
});
```

## Rota healthz
```typescript
GET /healthz   → { ok: true }          (liveness)
GET /livez     → { ok: true }          (mesmo que healthz — compatível com K8s)
GET /readyz    → { ok: true, checks }   (readiness — valida DB + Redis)
```

## SSE
```
GET /api/events
  → EventSource stream com eventos: order_updated, repricer_updated
```

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[API]]
