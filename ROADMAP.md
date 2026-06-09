# ROADMAP — Flux Delivery

> **43 fases concluídas.** Último commit: `5ebc84d` (pushado para `origin/main`).

---

## Etapa 1 — Fundação (Fases 1-6)

| Fase | Descrição | Status |
|------|-----------|--------|
| **1** | Tokens, Theme Provider, Primitivos (FxButton, FxText, FxInput, FxIcon, FxAvatar), Layout (FxContainer, FxStack, FxGrid, FxPageLayout) | ✅ |
| **2** | Home/Marketplace, Listagem Restaurantes, Restaurante+Cardápio, Detalhe Item, FxRestaurantCard, FxProductCard, FxDeliveryBadge, FxSearchField, FxBottomNavigation, FxNavbar | ✅ |
| **3** | Checkout e Pedidos: Carrinho→Checkout→Confirmação, Rastreamento, FxCartDrawer, FxCheckoutSummary, FxOrderTimeline, FxCouponField, FxPriceTag, FxQuantitySelector | ✅ |
| **4** | Auth e Perfil: Login OTP, Cadastro, Recuperação Senha, Perfil, FxOtpField, FxPhoneField, FxAuthLayout | ✅ |
| **5** | Admin Restaurante: Dashboard métricas, Pedidos tempo real, Cardápio, FxDashboardLayout, FxSidebar, FxProgressBar | ✅ |
| **6** | Polimento Enterprise: Dark mode, Multi-brand, Playwright, Storybook, Performance audit, Changesets | ✅ |

## Etapa 2 — Refatoração Arquitetural (Fases 7-14)

| Fase | Descrição | Status |
|------|-----------|--------|
| **7** | Remoção de arquivos obsoletos: viacepService, establishmentService, Toast legado, backups .rar | ✅ |
| **8** | Documentação: 9 documentos canônicos | ✅ |
| **9** | Rotas faltantes: menu-items, companies, branches, orders | ✅ |
| **10** | Correção conexão API: baseUrl, proxy, categorias | ✅ |
| **11** | Cleanup: ESLint 0 warnings, tabelas user_notifications + branch_settings | ✅ |
| **12** | Quebra dependências circulares (relations desacopladas) | ✅ |
| **13** | Refatoração arquitetural 7-phase | ✅ |
| **14** | Correção ESLint + Build (0 erros, 0 warnings) | ✅ |

## Etapa 3 — Infraestrutura Enterprise (Fases 15-23)

| Fase | Descrição | Status |
|------|-----------|--------|
| **15** | Memory Repository (EntityStore, IDs LCG+DJB2, snapshot/restore) | ✅ |
| **16** | Contract Schemas Zod (coverageCity, plan, globalCoupon, 23 testes endpoint parity) | ✅ |
| **17** | Environment Runtime (initRuntime, healthz/livez/readyz, capabilities) | ✅ |
| **18** | Snapshot Fixtures (serializador, snapshots registry, loader JSON, 18 testes) | ✅ |
| **19** | Telemetry Real (withSpan, recordSpanMetric, event emitter, 18 testes) | ✅ |
| **20** | Replay Recorder (gravação requisições por namespace, 21 testes) | ✅ |
| **21** | Chaos Router (ChaosScenario, latency/shouldFail/shouldTimeout) | ✅ |
| **22** | Resilience (delay, isTransientError, retry backoff+jitter, CircuitBreaker, runSaga compensator, 23 testes) | ✅ |
| **22b** | City-Guard Hardening (isSameCityName, normalizeCityName) | ✅ |
| **23** | IndexedDB Offline Storage (wrapper, mutation queue, ReconnectSync) | ✅ |

## Etapa 4 — Auditorias Production-Ready (Fases 24-29)

| Fase | Descrição | Status |
|------|-----------|--------|
| **24** | Segurança: 15 findings (JWT localStorage, refresh token JSON, CORS `*`, rate limit) | ✅ |
| **25** | React Runtime: runtime checks, error boundaries, memoização | ✅ |
| **26** | Camadas L1-L6: validação camadas, portas, adapters | ✅ |
| **27** | PWA/Offline: service worker, cache strategies, offline fallbacks | ✅ |
| **28** | Performance: Leaflet code-split, vendor chunks (5), bundle visualizer, Tailwind tree-shaking | ✅ |
| **29** | Documentação do Projeto: 9 documentos de arquitetura e memória | ✅ |

## Etapa 5 — Geocodificação e Cobertura (Fases 30-34)

| Fase | Descrição | Status |
|------|-----------|--------|
| **30** | Geocodificação: 8 ajustes no pipeline | ✅ |
| **31** | Pipeline Geocoding + Persistência (ViaCEP/Nominatim, endereços, filiais) | ✅ |
| **32** | Governança Geocoding + Auditoria Franca (schema coverage + campos geoespaciais) | ✅ |
| **33** | Remoção mockCoverageCities + Cobertura Geofencing-Ready (city coverage service + admin) | ✅ |
| **34** | Coordenadas Reais: 8 restaurantes, Bahia Lanches, ViaCEP address-lookup, Mobile | ✅ |

## Etapa 6 — Saneamento e Correções (Fases 35-37)

| Fase | Descrição | Status |
|------|-----------|--------|
| **35** | Mock Cleanup + Correções Runtime (coerceNumeric, normalizeStateBR, CITY_TTL=0, consolidação printer pages) | ✅ |
| **36** | Infrastructure Layer (Registry, ports, DI) | ✅ |
| **37** | Modular Operations Schema + Novas Rotas | ✅ |

## Etapa 7 — Pedidos e Cardápio (Fases 38-44)

| Fase | Descrição | Status |
|------|-----------|--------|
| **38** | MirrorService + Idempotency-Key + Order Hooks | ✅ |
| **39** | FK Constraints (Migration 0013 — 4 FKs) | ✅ |
| **40** | FK Materialization (Migration 0014 — 53/53) + Menu Items Unification + Seed | ✅ |
| **41** | State Machine Compartilhada + SSE Real | ✅ |
| **42** | KDS Board (board visual + timers + som) | ✅ |
| **43** | Unificar menu_items (Migration 0015): branch_id, is_visible_to_consumer, updated_at | ✅ |

## Etapa 8 — Additives, Notificações e Analytics (Fases 44-46)

| Fase | Descrição | Status |
|------|-----------|--------|
| **44** | Additives CRUD (CRUD adicionais, fix findAdditives, JOIN rotas públicas, merge carrinho) | ✅ |
| **45** | Web Push Notifications (Service Worker + Push API + notificação visual) | ✅ |
| **46** | Analytics e Financeiro (recharts, endpoints merchant-analytics + merchant-finance, hooks useMerchantAnalytics/useMerchantFinance, MSW) | ✅ |

## Fases Adicionais

| Fase | Descrição | Status |
|------|-----------|--------|
| **47** | Remoção módulo Enterprise órfão (14 arquivos deletados: páginas, repositórios, service, domain, schema) | ✅ |
| **48** | Fluxo condicional delivery/pickup (state machine, sync merchantOrders→orders, SSE bidi, push diferenciado, TrackingPage 4/5 steps) | ✅ |

## Commits de Referência

| Fase(s) | Commit |
|---------|--------|
| 1-6 | `d4f9a23` |
| 7-14 | `86a9dd2` · `92b42b4` · `1999d39` · `aeb09a7` |
| 15-18 | `436ebd7` |
| 19-23 | `436ebd7` |
| 24-25 | `c257eb2` · `8b60d33` |
| 26 | `7bb255d` · `9398dc3` · `68f1caa` |
| 27 | `53c5ca6` |
| 28 | `a73552b` |
| 29 | `d7d7b78` |
| 30 | `717f43d` |
| 31 | `68b3287` |
| 32 | `c9425cd` |
| 33 | `c511ed5` |
| 34 | `2780635` |
| 35+38 | `bad7786` |
| 36+37 | `8f7301b` |
| 39 | `6d716b6` |
| 35-39 (chore) | `3e25334` |
| 40 | `73c3954` |
| 41-48 | `5ebc84d` |

## Pendente

- Aplicar migration `0015` (DB Supabase indisponível no ambiente dev)
