# ROADMAP — Flux Delivery

> Todas as **41 fases** concluídas. Lista completa abaixo.

---

## Etapa 1 — Produto Inicial (iFood Clone)

### Fase 1 — Fundação
**Tokens** (cores, tipografia, espaçamento), **Theme Provider** (light/dark), **Primitivos** (FxButton, FxText, FxInput, FxIcon, FxAvatar), **Layout** (FxContainer, FxStack, FxGrid, FxPageLayout)

### Fase 2 — Telas Core
Home/Marketplace, Listagem de Restaurantes, Restaurante + Cardápio, Detalhe do Item, FxRestaurantCard, FxProductCard, FxDeliveryBadge, FxSearchField, FxBottomNavigation, FxNavbar

### Fase 3 — Checkout e Pedidos
Carrinho → Checkout → Confirmação, Rastreamento de Pedido, FxCartDrawer, FxCheckoutSummary, FxOrderTimeline, FxCouponField, FxPriceTag, FxQuantitySelector, FxStepper, FxAlertDialog, FxLoadingOverlay

### Fase 4 — Auth e Perfil
Login por Telefone + OTP, Cadastro + Recuperação de Senha, Perfil do Usuário, FxOtpField, FxPhoneField, FxAuthLayout

### Fase 5 — Admin do Restaurante
Dashboard com métricas, Gestão de pedidos em tempo real, Gerenciamento de cardápio, FxDashboardLayout, FxSidebar, FxProgressBar

### Fase 6 — Polimento Enterprise
Dark mode completo, Multi-brand, Visual regression tests (Playwright), Storybook, Performance audit (Lighthouse > 90), Publicação via Changesets + Semantic Versioning

---

## Etapa 2 — Refatoração Arquitetural Inicial

### Fase 7 — Remoção de Arquivos Obsoletos
viacepService, establishmentService, Toast legado, backups .rar

### Fase 8 — Documentação do Projeto
Geração de 9 documentos canônicos de documentação

### Fase 9 — Implementação de Rotas Faltantes
menu-items, companies, branches, orders — todas as rotas API implementadas

### Fase 10 — Correção de Conexão API
baseUrl, proxy e rota de categorias faltantes

### Fase 11 — Cleanup Final
ESLint 0 warnings, tabelas user_notifications + branch_settings

### Fase 12 — Quebra de Dependências Circulares
Phase 2 — relations desacopladas

### Fase 13 — Refatoração Arquitetural 7-Phase
Refatoração completa em 7 fases da arquitetura do projeto

### Fase 14 — Correção ESLint + Build
Resolução de todos os erros ESLint e warnings TypeScript

---

## Etapa 3 — Infraestrutura Enterprise

### Fase 15 — Memory Repository
Repositórios em memória 100% determinísticos (EntityStore, IDs LCG+DJB2, timestamps controlados, snapshot/restore)

### Fase 16 — Contract Schemas (Zod)
Single source of truth para payloads de API (coverageCity, plan, globalCoupon — 23 testes de endpoint parity)

### Fase 17 — Environment Runtime
Auto-bootstrap completo: `initRuntime(env)`, healthz/livez/readyz, capabilities (replay, chaos, telemetry)

### Fase 18 — Snapshot Fixtures
Serializador de entidades, snapshots de registry, loader de fixtures JSON (18 testes)

### Fase 19 — Telemetry Real
`withSpan`, `recordSpanMetric`, evento emitter (18 testes)

### Fase 20 — Replay Recorder
Gravação de requisições por namespace (21 testes)

### Fase 21 — Chaos Router
ChaosScenario, getActiveChaosScenarios, latency/shouldFail/shouldTimeout

### Fase 22 — Resilience
`delay()`, `isTransientError()`, `retry()` backoff+jitter, CircuitBreaker (CLOSED/HALF_OPEN/OPEN), `runSaga()` com compensator rollback

### Fase 22b — City-Guard Hardening
`isSameCityName()` + `normalizeCityName` em useLiveCityEstablishments e memory-restaurants

### Fase 23 — IndexedDB Offline Storage
Wrapper IndexedDB (setItem/getItem/removeItem/clearStore), fila de mutations, ReconnectSync singleton

---

## Etapa 4 — Auditorias Production-Ready

### Fase 24 — Auditoria de Segurança (Production-Ready #1)
15 findings: JWT em localStorage, refresh token em JSON, CORS `*`, token exposto em logs, sem rate limit

### Fase 25 — Auditoria React Runtime (Production-Ready #2)
Runtime checks, error boundaries, memoização, render optimization

### Fase 26 — Auditoria Camadas L1-L6 (Production-Ready #3)
Validação de camadas arquiteturais, portas, adapters

### Fase 27 — Auditoria PWA/Offline (Production-Ready #4)
Service worker, cache strategies, offline fallbacks

### Fase 28 — Auditoria Performance (Production-Ready #5)
Leaflet code-split (AddressMap), vendor chunk splitting (5 chunks), bundle visualizer, Tailwind CSS tree-shaking

### Fase 29 — Documentação do Projeto
Geração de 9 documentos de documentação e memória

---

## Etapa 5 — Geocodificação e Cobertura

### Fase 30 — Geocodificação (Refatoração 8 Ajustes)
Correções no pipeline de geocodificação

### Fase 31 — Pipeline de Geocoding + Persistência
Address autocomplete (ViaCEP/Nominatim), persistência de endereços e filiais

### Fase 32 — Governança de Geocoding + Auditoria França
Schema de coverage + campos geoespaciais de restaurante

### Fase 33 — Remoção de mockCoverageCities + Cobertura Geofencing-Ready
City coverage service + admin panel

### Fase 34 — Coordenadas Reais
8 restaurantes com coordenadas reais, Bahia Lanches, ViaCEP address-lookup, Mobile

---

## Etapa 6 — Saneamento e Correções

### Fase 35 — Mock Cleanup + Correções Runtime
coerceNumeric, normalizeStateBR, CITY_TTL=0, consolidação printer pages

### Fase 36 — Infrastructure Layer
Registry, ports, DI (infrastructure layer completa)

### Fase 37 — Modular Operations Schema + New Routes
Schema modular de operations, novas rotas

### Fase 38 — MirrorService + Idempotency-Key + Order Hooks
MirrorService, idempotency-key, order hooks + auth

### Fase 39 — FK Constraints (Migration 0013 — 4 FKs)
Materialização de 4 FK constraints em orders/branches

---

## Etapa 7 — Pedidos e Cardápio

### Fase 40 — FK Materialization + Menu Items Unification (Migration 0014 — 53/53)
53 FKs materializadas no DB, unificação menu_items + merchant_menu_items, seed

### Fase 41 — State Machine Compartilhada + SSE Real
State machine no backend, SSE em tempo real

### Fase 42 — KDS Board
Board visual KDS com timers + som

### Fase 43 — Unificar menu_items (Migration 0015)
branch_id, is_visible_to_consumer, updated_at em menu_items; merchant_menu_items deprecada

### Fase 44 — Additives CRUD
CRUD de adicionais, fix findAdditives, JOIN em rotas públicas, merge no carrinho

---

## Etapa 8 — Notificações e Analytics

### Fase 45 — Web Push Notifications
Notificações push nativas (Service Worker + Push API + notificação visual)

### Fase 46 — Analytics e Financeiro
recharts, endpoints merchant-analytics + merchant-finance, gráficos (linha/barra/pizza), hooks useMerchantAnalytics + useMerchantFinance

---

## Commits de Referência

| Fase(s) | Commit |
|---------|--------|
| 1-6 | `d4f9a23` — primeiro commit |
| 7-14 | `86a9dd2` · `92b42b4` · `1999d39` · `aeb09a7` |
| 15-18 | `436ebd7` (FASE 19-23 inclui) |
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
| 41 | Atual (não commitado) |
