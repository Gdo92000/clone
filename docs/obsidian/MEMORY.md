---
type: memory
status: active
aliases:
- Memoria
- Obsidian MEMORY
- Memoria Operacional
- Session Memory
created_at: 2026-05-23
updated_at: 2026-05-23
related:
- CURRENT_STATE.md
tags:
- type/memory
---

# Memória Operacional

## Estado atual

Vault restructuring concluído (Fases 1-9). Conectividade: 3.2→10/10. Resolução (weighted): 65.6%→99.6%. Órfãs: 27→0. 1,017 total links, ~100% resolved. Tag coverage: 100%. Basename collisions: 0. Code reference wikilinks resolvidos via 4 consolidated notes + generator fix.

> [!tip] Navegação
> [[MOC — Histórico do Projeto]] · [[CURRENT_STATE]] · [[Estado do Projeto — Fases]]

## Progresso consolidado

- Fases 1-24 concluídas (código + infraestrutura)
- Fases 1-5 (auditorias): segurança, React runtime, camadas L1-L6, PWA/offline, performance
- Fases 15-24 (enterprise): memory repo, contract schemas, env runtime, snapshots, telemetry, replay, chaos, resilience, IndexedDB, proximity
- Cobertura de testes: 242 testes (17 suítes)
- Lint otimizado: 120s+ → ~13s (cache)

## Auditorias concluídas

| Auditoria | Críticos | Altos | Médios | Baixos |
|-----------|----------|-------|--------|--------|
| Segurança | 3 | 6 | 4 | 2 |
| Camadas L1-L6 | 6 | 8 | 4 | 2 |
| Ciclos de dependência | 0 | 11 | 0 | 0 |
| Build/Bundle | 0 | 1 | 2 | 0 |
| React Runtime | 3 | 9 | 9 | 2 |
| Offline/Resiliência | 1 | 3 | 2 | 1 |
| **Total** | **10** | **18** | **18** | **7** |

## Fase 1 — Segurança + Ciclos ✅

- `src/api/tokenManager.ts` — módulo puro de gestão de tokens, zero imports de `services/` ou `api/`
- `src/api/httpClient.ts` — migrado de `authService` → `tokenManager` (rompe 11 ciclos), `credentials: 'include'`
- `src/services/authService.ts` — refatorado para usar `tokenManager`
- `src/hooks/useSSE.ts` — importa `getToken` de `tokenManager` diretamente
- `server/src/lib/cookieConfig.ts` + `server/src/routes/auth.ts` — httpOnly cookie para refresh token
- Tokens migrados de `localStorage` → `sessionStorage` + httpOnly cookie

| Métrica | Antes | Depois |
|---------|-------|--------|
| Ciclos de dependência | 11 | **0** |
| Token storage | localStorage (XSS-critical) | sessionStorage + httpOnly cookie |
| Refresh token | JSON body | httpOnly cookie (fallback body) |

## Fase 2 — React Runtime ✅

- `src/App.tsx` — `<ErrorBoundary> + <Suspense>` envolvendo todas as `<Routes>`
- `src/modules/saas/useSaasWorkspace.ts` — render-phase setState → `useMemo` derivation pura
- 3 providers estabilizados com `useMemo` (LocationContext, OnlineStatus, ThemeContext)
- 5 mutations agora têm `onError` com toast

| Métrica | Antes | Depois |
|---------|-------|--------|
| React Runtime críticos | 3 | **0** |
| Rotas sem Suspense | 11 | 0 |

## Fase 3 — Camadas L1-L6 ✅

- 2 hooks corrigidos: `useAuthSession`, `useAuditLog` → hook → service → api (REST)
- 1 componente corrigido: `LocationSelector` → função inlinada
- 3 páginas corrigidas: `CityRestaurantsPage`, `HomePage`, `RestaurantListPage` → funções locais

| Métrica | Antes | Depois |
|---------|-------|--------|
| Hook → API direto | 2 | **0** |
| Componente → Service | 1 | **0** |
| Página → Service | 3 | **0** |

## Fase 4 — PWA + Offline + IndexedDB ✅

- `vite-plugin-pwa@1.3.0` — Service Worker com `generateSW` (119 assets precached)
- Manifest: nome "Flux Delivery", theme_color `#523bff`, standalone, 192x192 + 512x512 icons
- API Caching: `StaleWhileRevalidate` (24h TTL para `/api/*`)
- `OnlineStatusProvider` — `ReconnectSync` integrado (onConnect/onDisconnect)

| Métrica | Antes | Depois |
|---------|-------|--------|
| Service Worker | ❌ | ✅ generateSW |
| PWA Manifest | ❌ | ✅ manifest.webmanifest |
| API Caching | ❌ | ✅ StaleWhileRevalidate |

## Fase 5 — Performance ✅

- `AddressMap.tsx` — static `import L from 'leaflet'` → dynamic import com loading/error states
- `vite.config.ts` — `manualChunks`: `vendor-leaflet`, `vendor-tanstack`, `vendor-router`
- `rollup-plugin-visualizer` — `dist/stats.html` a cada build
- Tailwind v4 auto-purge confirmado (651 regras, 190KB raw / 28KB gzip)

| Métrica | Antes | Depois |
|---------|-------|--------|
| Leaflet no bundle principal | 148KB em vendor-other | ✅ 148KB chunk separado (lazy) |
| Vendor chunks | 3 | 5 |

## Fases 15-24 — Enterprise Infrastructure ✅

| Fase | Nome | Arquivos-chave |
|------|------|---------------|
| 15 | Memory Repository | `base-memory.ts`, `memory-restaurants.ts`, `registry-memory.ts`, `db/index.ts` |
| 16 | Contract Schemas | `shared/validations/` (coverageCity, plan, globalCoupon) + 23 testes paridade |
| 17 | Environment Runtime | `environmentRuntime.ts` + stubs telemetry/replay/chaos + `/healthz` `/livez` `/readyz` |
| 18 | Snapshot Fixtures | `serializer.ts`, `registry-shots.ts`, `loader.ts` + 18 testes |
| 19 | Telemetry | `telemetry/router.ts` — real em postgres, no-op em memory + 18 testes |
| 20 | Replay Recorder | `replay/recorder.ts` — grava requisições HTTP por namespace + 21 testes |
| 21 | Chaos Router | `chaos/router.ts` — `latencyMs`, `errorRate`, `simulateTimeout` (memory only) |
| 22 | Resilience | `resilience/index.ts` — `retry()`, `CircuitBreaker`, `runSaga()` |
| 22b | City-Guard | `useLiveCityEstablishments` — `isSameCityName()` em toda validação |
| 23 | IndexedDB Offline | `src/lib/storage/index.ts` — mutation queue + `ReconnectSync` |
| 24 | Proximity | Seed bug corrigido + 32 testes novos (coverage, location, cityCoverage) |

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, TanStack Query 5 |
| Backend | Hono 4, `@hono/node-server`, Drizzle ORM 0.45, Zod 4 |
| DB | PostgreSQL (Supabase) |
| Auth | JWT HS256 + bcryptjs + refresh tokens + httpOnly cookie |
| Testes | Vitest (dual-project: frontend jsdom / server node) + MSW v2 |
| Packages | `@fluxds/tokens`, `@fluxds/ui` |

## Arquitetura de Camadas

```
L1 frontend (React, componentes)
  ↓ imports
L2 API layer (src/api/ — httpClient NÃO exportado para componentes)
  ↓ chamadas
L3 Repositórios (src/repositories/)
  ↓
L4 Casca de validação (DTOs + Zod)
  ↓
L5 Serviços de domínio
  ↓
L6 Rotas Hono (server/src/routes/)
```

- `DATABASE_PROVIDER=postgres` → repositórios Postgres (Drizzle)
- `DATABASE_PROVIDER=memory` → repositórios em memória determinísticos
