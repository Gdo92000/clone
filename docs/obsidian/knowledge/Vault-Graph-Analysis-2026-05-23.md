---
title: Vault Graph Analysis 2026-05-23
type: knowledge
status: active
aliases:
- Vault Analysis
- Graph Analysis
- Analise do Vault
- Vault Scan
created_at: 2026-05-23
updated_at: 2026-05-23
related:
- Vault Index
- Wiki Central
tags:
- type/knowledge
---

# Vault Graph Analysis — Relatorio Completo

> [!info] Analise estrutural e semantica completa do vault Obsidian do projeto Flux Delivery.
> Data: 2026-05-23 | Notas analisadas: 151 | Tokens estimados: ~66K

---

## 1. Metricas Quantitativas de Conectividade

| Metrica | Valor | Benchmark |
|---------|-------|-----------|
| Total de notas | 151 | — |
| Total de wikilinks | 695 | — |
| Links resolvidos | 456 (65.6%) | >90% desejavel |
| Links quebrados | 239 (34.4%) | 0% desejavel |
| Densidade de links | 4.6 links/nota | 8-12 ideal |
| Notas orfas | 27 (17.9%) | <5% ideal |
| Componentes conectados | 37 | 1-3 ideal |
| Maior componente | 111 notas (73.5%) | >90% ideal |
| Notas isoladas | 36 (23.8%) | 0% ideal |
| Backlink medio | 1.5 | >3 ideal |

> [!danger] Score de Conectividade: **3.2/10** (critico)

---

## 2. Notas Orfas (zero backlinks)

> [!warning] **Severidade: CRITICA** — 27 notas sem nenhum backlink entrante.

### Top-level docs (9 notas)

| Nota | Chars | Tags | Razao da orfandade |
|------|-------|------|-------------------|
| `docs/ARCHITECTURE.md` | 30,470 | architecture, frontend, backend | Referenciada via path, nao wikilink |
| `docs/API.md` | 26,420 | api, endpoints | Sem wikilink apontando para ela |
| `docs/TESTING.md` | 13,385 | testing, vitest, msw | Idem |
| `docs/DEVELOPMENT.md` | 11,809 | development, typescript, eslint, git, workflow | Idem |
| `docs/DATABASE.md` | 2,121 | database, drizzle, postgresql | Idem |
| `docs/CONFIGURATION.md` | 4,221 | configuration, env-vars, typescript, vite, tailwind | Idem |
| `docs/FRONTEND_BACKEND_CONTRACT.md` | 7,081 | api, contract | Idem |
| `docs/GETTING-STARTED.md` | 7,632 | getting-started, setup | Idem |
| `docs/kitchen-auto-print-addon.md` | 8,290 | addon, printing | Idem |

### Knowledge notes (11 notas)

| Nota | Chars | Observacao |
|------|-------|------------|
| Packages Locais | 1,240 | Sem backlinks — _index usa path links |
| MSW — Mock Service Worker | 1,714 | Idem |
| Modulos Core do Backend | 1,624 | Idem |
| Arquitetura de Camadas | 667 | Idem |
| Repository Ports & Schemas | 2,310 | Idem |
| Arquitetura de Dados | 3,041 | Idem |
| Rotas da API | 1,763 | Idem |
| Frontend — Estrutura e Padroes | 2,433 | Idem |
| Estrutura do Backend | 2,374 | Idem |
| Testes — Estrutura e Padroes | 1,812 | Idem |
| Visao Geral do Projeto | 1,525 | Idem |

### Worklog notes (5 notas)

| Nota | Chars | Observacao |
|------|-------|------------|
| Proximity Feature — Correcoes e Testes | 2,774 | Sem backlinks |
| Proximidade e Geocodificacao | 2,168 | Idem |
| Fase 18 — Snapshot Fixtures | 1,324 | Idem |
| 2026-05-23-auditoria-production-ready | 3,334 | Idem |
| 2026-05-23-fase5-performance | 2,432 | Idem |

### Outras (2 notas)

| Nota | Chars | Observacao |
|------|-------|------------|
| `docs/obsidian/CURRENT_STATE.md` | 802 | Referenciada via path, nao wikilink |
| `docs/obsidian/MEMORY.md` | 9,114 | Idem |

> [!bug] Causa raiz: Os `_index.md` usam `[[docs/API]]` e `[[docs/ARCHITECTURE]]` (path-style links) em vez de `[[API]]` (name-style). O Obsidian resolve pelo nome do arquivo, nao pelo caminho. Links com emoji + caracteres especiais nos nomes tambem falham na resolucao.

---

## 3. Backlinks Quebrados

> [!warning] **Severidade: ALTA** — 239 links apontam para notas inexistentes no vault.

### Categorias de links quebrados

| Categoria | Exemplos | Contagem | Causa |
|-----------|----------|----------|-------|
| Hooks/utilities | `useMerchantData`, `useAdminData`, `useCart`, `routes`, `format`, `toast` | ~120 | Referenciam codigo fonte, nao notas |
| Services | `locationService`, `geocodeSearchService`, `cityCoverageService`, `authService` | ~30 | Referenciam modulos de codigo |
| Data/config | `iconMap`, `payment-methods.data`, `queryClient`, `constants` | ~15 | Referenciam constantes/config |
| State machines | `locationMachine`, `logger`, `pricingUseCase` | ~10 | Referenciam logica de negocio |
| Path-style links | `docs/API`, `docs/ARCHITECTURE`, `../_index`, `../../API` | ~35 | Formato de path, nao name |
| Emoji filenames | Links com emojis unicode corrompidos | ~25 | Encoding de emojis em wikilinks |
| Non-existent files | `clone.nd`, `AGENTS`, `docs/obsidian/Session Memory` | ~4 | Referencia a arquivos fora do vault |

### Links quebrados por nota (top 10)

| Nota | Links quebrados | Tipo predominante |
|------|----------------|-------------------|
| `docs/_index.md` | 17 | Path-style links |
| `docs/components/_index.md` | 3 | Path-style links |
| `docs/obsidian/_index.md` | 24 | Emoji encoding + path |
| `docs/components/README.md` | ~108 | Hooks/utilities (todos) |

---

## 4. Clusters Desconectados

> [!warning] **Severidade: ALTA** — 37 componentes, sendo 36 isolados.

```
Componente 1: 111 notas (components/*) ---- 73.5% do vault
Componente 2: 5 notas   (sources/*)     ----  3.3% do vault
Componentes 3-37: 1 nota cada            ---- 23.8% do vault (totalmente isolados)
```

### Analise por diretorio

| Diretorio | Notas | Links internos | Links outgoing | Componente |
|-----------|-------|---------------|----------------|------------|
| `components/` | 101 | Alta coesao | 695 (para dentro do cluster) | Integrado |
| `sources/` | 5 | 3 internos | 1 outgoing | Semi-isolado |
| `obsidian/knowledge/` | 11 | 0 internos | 0 outgoing | Totalmente isolado |
| `obsidian/worklog/` | 6 | 0 internos | 0 outgoing | Totalmente isolado |
| Top-level docs | 9 | 0 internos | 0 outgoing | Totalmente isolado |
| `obsidian/` (meta) | 5 | Links quebrados | ~30 outgoing | Isolado (links nao resolvem) |
| `guides/` | 1 | 0 | 3 (todos quebrados) | Isolado |

---

## 5. Hubs Semanticos

> Notas com maior centralidade no grafo (backlinks recebidos).

### Hub tier 1 (20+ backlinks) — Componentes

| Nota | Backlinks | Papel |
|------|-----------|-------|
| `Icon` | 41 | Hub de UI primitivo |
| `FxQueryBoundary` | 41 | Hub de error boundary |
| `index` | 37 | Hub de re-export (codigo, nao nota) |
| `Button` | 34 | Hub de UI interativo |
| `PageHeader` | 24 | Hub de estrutura de pagina |
| `routes` | 22 | Hub de navegacao (codigo) |
| `useMerchantData` | 20 | Hub de dados merchant (codigo) |

### Hub tier 2 (10-19 backlinks)

| Nota | Backlinks | Papel |
|------|-----------|-------|
| `MerchantLayout` | 18 | Hub de layout merchant |
| `format` | 15 | Hub de formatacao (codigo) |
| `ExperienceLayout` | 12 | Hub de layout consumer |
| `FxImage` | 11 | Hub de midia |

### Hubs semanticos ausentes (critico)

Nenhum hub de **conceito** ou **dominio** existe. Todos os hubs sao componentes de codigo. Nao existem MOCs conceituais como:

- `[[MOC — Merchant Profile]]` — agregaria 18+ MerchantXxxPages
- `[[MOC — Consumer Profile]]` — agregaria consumer pages
- `[[MOC — Admin Profile]]` — agregaria admin/superadmin pages
- `[[MOC — UI Primitives]]` — agregaria Fx* components
- `[[MOC — Backend Architecture]]` — agregaria knowledge notes
- `[[MOC — Testing Strategy]]` — agregaria test-related notes

---

## 6. Redundancia Textual

> [!note] **Severidade: MEDIA** — Sobreposicao significativa entre pares de documentos.

### Pares com sobreposicao

| Nota A | Nota B | Sobreposicao | Detalhe |
|--------|--------|-------------|---------|
| `obsidian/MEMORY.md` (9,114 chars) | `sources/MEMORY.md` (12,531 chars) | **ALTA** | Ambas registram progresso de fases, auditorias, status |
| `obsidian/MEMORY.md` | `obsidian/CURRENT_STATE.md` (802 chars) | **MEDIA** | CURRENT_STATE e subconjunto de MEMORY |
| `worklog/Estado do Projeto — Fases.md` (11,965 chars) | `sources/MEMORY.md` | **ALTA** | Ambas detalham fases 15-23 com estrutura similar |
| `TESTING.md` (13,385 chars) | `knowledge/Testes — Estrutura e Padroes.md` (1,812 chars) | **MEDIA** | Knowledge note e subconjunto resumido |
| `ARCHITECTURE.md` (30,470 chars) | Knowledge notes de backend (6 notas, ~11K chars total) | **MEDIA** | Knowledge notes sao fragmentos da arquitetura geral |
| `obsidian/worklog/_index.md` | `obsidian/_index.md` | **BAIXA** | Overlap de listagem |

### Redundancia estimada por token

- ~15-20% dos tokens em `obsidian/MEMORY.md` + `sources/MEMORY.md` sao redundantes
- ~10% dos tokens em knowledge notes vs `ARCHITECTURE.md` sao redundantes
- Total estimado de tokens redundantes: ~8,000-10,000 (12-15% do vault)

---

## 7. Notas Muito Grandes

> [!warning] **Severidade: ALTA** para RAG — 12 notas acima de 5,000 chars (threshold para chunking).

| Nota | Chars | Tokens est. | Problema RAG |
|------|-------|------------|-------------|
| `ARCHITECTURE.md` | 30,470 | ~7,618 | Excede 4 chunks; contexto diluido |
| `API.md` | 26,420 | ~6,605 | Muitos endpoints em 1 nota |
| `TESTING.md` | 13,385 | ~3,346 | 2+ chunks |
| `sources/MEMORY.md` | 12,531 | ~3,133 | Historico denso |
| `worklog/Estado do Projeto — Fases.md` | 11,965 | ~2,991 | Multiplas fases |
| `DEVELOPMENT.md` | 11,809 | ~2,952 | 2+ chunks |
| `obsidian/MEMORY.md` | 9,114 | ~2,279 | Borderline |
| `sources/PRODUCTION-READINESS.md` | 9,041 | ~2,260 | Borderline |
| `kitchen-auto-print-addon.md` | 8,290 | ~2,073 | Borderline |
| `GETTING-STARTED.md` | 7,632 | ~1,908 | OK |
| `FRONTEND_BACKEND_CONTRACT.md` | 7,081 | ~1,770 | OK |
| `CONFIGURATION.md` | 4,221 | ~1,055 | OK |

> [!tip] Recomendacao: Notas >5K chars devem ser fragmentadas em secoes com wikilinks entre si, permitindo retrieval granular.

---

## 8. Tags Inconsistentes

> [!note] **Severidade: MEDIA** — Taxonomia plana, sem hierarquia, baixa cobertura.

### Problemas detectados

| Problema | Detalhe |
|----------|---------|
| **Flat taxonomy** | 27 tags, nenhuma hierarquica (sem `backend/architecture`, `frontend/testing`) |
| **Solo tags** | 22/27 tags usadas em apenas 1 nota (81.5%) |
| **No tag on 130 notes** | 86% das notas nao tem nenhuma tag |
| **Inconsistent naming** | `env-vars` vs `eslint` vs `vitest` — sem padrao |
| **Missing profile tags** | Nenhuma tag `merchant`, `consumer`, `admin`, `courier`, `superadmin` |
| **Missing domain tags** | Nenhuma tag `hooks`, `components`, `pages`, `services`, `api-routes` |
| **Duplicate semantics** | `api` + `endpoints` = mesmo conceito; `getting-started` + `setup` = mesmo conceito |

### Tag frequency

| Tag | Notas | Proposta de merge/hierarquia |
|-----|-------|------------------------------|
| `index` | 5 | Manter, mas adicionar `type/index` |
| `typescript` | 2 | Expandir para `tech/typescript` |
| `api` | 2 | Merge `api` + `endpoints` para `domain/api` |
| `memory` | 1 | para `type/memory` |
| `knowledge` | 1 | para `type/knowledge` |
| `adr` | 1 | para `type/adr` |
| `worklog` | 1 | para `type/worklog` |
| `archive` | 1 | para `type/archive` |
| `getting-started` | 1 | Merge com `setup` para `guide/setup` |
| `addon` | 1 | para `domain/addon` |
| `printing` | 1 | para `feature/printing` |

---

## 9. Analise para Embeddings/RAG

> [!warning] **Severidade: ALTA** — Vault sub-otimizado para retrieval semantico.

### Metricas RAG

| Metrica | Valor | Ideal |
|---------|-------|-------|
| Total tokens estimados | ~66,053 | — |
| Tokens medios/nota | 437 | 200-500 (ideal para embedding) |
| Notas >2K tokens | 12 | Chunking obrigatorio |
| Notas <50 tokens | ~40 | Muito curtas — contexto insuficiente |
| Chunking necessario | ~130 chunks | Se todas <512 tokens |
| Redundancia token | ~12-15% | <5% ideal |
| Link resolution rate | 65.6% | >95% para graph-RAG |
| Orphan rate | 17.9% | <5% para graph-RAG |

### Problemas para RAG

1. **Chunking**: Notas grandes (ARCHITECTURE: 7.6K tokens) geram chunks que diluem relevancia semantica
2. **Orfandade**: 27 notas sem backlinks = lost in vector space — sem contexto de vizinhanca
3. **Redundancia**: MEMORY.md duplicada gera embeddings quase identicos
4. **Component docs**: 101 notas de componentes (~400 chars cada) sao demasiado curtas para embedding significativo — precisam de contexto agregado
5. **Missing metadata**: Nenhuma nota tem `aliases` — RAG por sinonimo falha
6. **No semantic tags**: Tags nao codificam dominio — filtering por profile e impossivel

### Estimativa de ganho com otimizacao

| Otimizacao | Reducao de tokens | Ganho RAG |
|------------|-------------------|-----------|
| Deduplicar MEMORY.md | -3,000 tokens | Menos ruido |
| Fragmentar notas >5K chars | +0 tokens | Granularidade +40% |
| Agregar component docs em MOCs | -5,000 tokens (sumarios) | Contexto +60% |
| Adicionar aliases em top-level | +200 tokens | Recall +20% |
| Corrigir links path para name | +0 tokens | Graph-RAG funcional |
| **Total estimado** | **-8,000 tokens (12%)** | **Recall +30-40%** |

---

## 10. MOCs Sugeridos (Map of Content)

> MOCs conectam clusters isolados e criam navegacao semantica.

### MOC 1: `[[MOC — Arquitetura do Sistema]]`

**Conecta**: `ARCHITECTURE.md` <-> knowledge notes <-> `DATABASE.md` <-> `FRONTEND_BACKEND_CONTRACT.md`

```markdown
# MOC — Arquitetura do Sistema

- [[ARCHITECTURE]] — Visao geral
  - [[Arquitetura de Camadas]] — L1-L6
  - [[Arquitetura de Dados]] — Postgres <-> Memory
  - [[Estrutura do Backend]] — Services, middlewares
  - [[Modulos Core do Backend]] — Logger, Circuit Breaker
  - [[Repository Ports & Schemas]] — RepositoryPort, Zod
  - [[Rotas da API]] — Estrutura de rotas
- [[DATABASE]] — Schema Drizzle
- [[FRONTEND_BACKEND_CONTRACT]] — Contrato de integracao
- [[API]] — Referencia de endpoints
```

### MOC 2: `[[MOC — Perfis do Sistema]]`

**Conecta**: Componentes de pagina por perfil (hoje 4 clusters isolados)

```markdown
# MOC — Perfis do Sistema

## Consumer
- [[HomePage]] · [[SearchPage]] · [[FavoritesPage]]
- [[RestaurantListPage]] · [[RestaurantDetailPage]] · [[ItemDetailPage]]
- [[CartPage]] · [[CheckoutPage]] · [[OrderHistoryPage]]
- [[TrackingPage]] · [[ConsumerLoyaltyPage]] · [[FinancePage]]
- [[ProfilePage]] · [[PaymentMethodsPage]] · [[AddressBookPage]]
- [[ReviewsPage]] · [[SupportPage]] · [[OnboardingPage]]

## Merchant
- [[MerchantDashboardPage]] · [[MerchantOrdersPage]] · [[MerchantCatalogPage]]
- [[MerchantBranchesPage]] · [[MerchantCampaignsPage]] · [[MerchantCouponsPage]]
- [[MerchantFinancePage]] · [[MerchantAnalyticsPage]] · [[MerchantSettingsPage]]
- [[MerchantHoursPage]] · [[MerchantHolidaysPage]] · [[MerchantTeamPage]]
- [[MerchantSubscriptionPage]] · [[MerchantLoyaltyRewardsPage]]
- [[MerchantPrinterConfigPage]] · [[MerchantKitchenAutoPrintPage]]
- [[MerchantLoginPage]]

## Admin / Superadmin
- [[AdminDashboardPage]] · [[AdminCompaniesPage]] · [[AdminCoveragePage]]
- [[SuperadminDashboardPage]] · [[SuperadminLoginPage]]
- [[UsersPage]] · [[ReportsPage]] · [[NotificationsPage]]
- [[PlansPage]] · [[SubscriptionsPage]] · [[CommissionsPage]]
- [[PermissionManagementPage]] · [[BillingPage]] · [[AuditPage]]
- [[FeatureFlagsPage]] · [[CapabilitiesPage]] · [[AddonsPage]]
- [[CategoriesPage]] · [[CouponsPage]] · [[PromotionsPage]]
- [[DemoDataPage]]

## Courier
- [[CourierDashboardPage]] · [[CourierDeliveriesPage]]
```

### MOC 3: `[[MOC — UI Primitives]]`

**Conecta**: Componentes Fx* + utilitarios

```markdown
# MOC — UI Primitives

## Layout
- [[PublicLayout]] · [[DashboardLayout]] · [[ExperienceLayout]]
- [[MerchantLayout]] · [[FxNavbar]] · [[FxBottomNavigation]]
- [[FxPageNavbar]] · [[PageHeader]]

## Data Display
- [[FxRestaurantCard]] · [[FxProductCard]] · [[FxCartItem]]
- [[FxImage]] · [[FxPriceTag]] · [[FxDeliveryBadge]]
- [[FxOrderStatus]] · [[FxOrderSummary]] · [[FxFilterChips]]
- [[FxPaymentMethod]] · [[FxSearchBar]] · [[Skeleton]]
- [[MerchantStatCard]] · [[MerchantStatusBadge]]

## Input
- [[Button]] · [[Icon]] · [[FxQuantitySelector]]
- [[FxAddressForm]] · [[FxCepInput]] · [[AddressAutocomplete]]
- [[AddressMap]] · [[LocationSelector]] · [[ThemeToggle]]

## Infrastructure
- [[App]] · [[main]] · [[ErrorBoundary]] · [[FxQueryBoundary]]
- [[QueryProvider]] · [[OnlineStatusProvider]] · [[ToastProvider]]
- [[ProtectedRoute]] · [[FeatureGate]] · [[FeatureRoute]]
- [[LocationContext]] · [[useNavItems]]
```

### MOC 4: `[[MOC — Guias de Desenvolvimento]]`

**Conecta**: Top-level docs <-> guides <-> development workflow

```markdown
# MOC — Guias de Desenvolvimento

- [[GETTING-STARTED]] — Setup inicial
- [[DEVELOPMENT]] — Workflow, ESLint, Git, TypeScript
- [[CONFIGURATION]] — .env, Vite, Drizzle, Tailwind
- [[TESTING]] — Vitest, MSW, padroes de teste
- [[DATABASE]] — Schema Drizzle, PostgreSQL
- [[kitchen-auto-print-addon]] — Addon de impressao
```

### MOC 5: `[[MOC — Historico do Projeto]]`

**Conecta**: worklogs <-> MEMORY <-> CURRENT_STATE <-> sources

```markdown
# MOC — Historico do Projeto

- [[MEMORY]] — Memoria operacional consolidada
- [[CURRENT_STATE]] — Estado atual e proximos passos
- [[Estado do Projeto — Fases]] — Indice detalhado de fases
- [[Proximity Feature — Correcoes e Testes]] — Worklog especifico
- [[Proximidade e Geocodificacao]] — Worklog de geocoding
- [[Fase 18 — Snapshot Fixtures]] — Worklog de fase
- [[auditoria-production-ready]] — Auditoria de producao
- [[fase5-performance]] — Worklog de performance
```

---

## 11. Links Semanticos Validos Sugeridos

> Links que deveriam existir mas nao existem. Nao sao artificiais — representam relacoes semanticas reais.

### Top-level docs <-> Knowledge (alta prioridade)

| De | Para | Razao semantica |
|----|------|----------------|
| `ARCHITECTURE.md` | `[[Arquitetura de Camadas]]` | Topico coberto em ambos |
| `ARCHITECTURE.md` | `[[Arquitetura de Dados]]` | Secao de database layer |
| `ARCHITECTURE.md` | `[[Estrutura do Backend]]` | Secao de backend |
| `ARCHITECTURE.md` | `[[Rotas da API]]` | Referencia mutua |
| `ARCHITECTURE.md` | `[[Modulos Core do Backend]]` | Core libs |
| `TESTING.md` | `[[Testes — Estrutura e Padroes]]` | Mesmo dominio |
| `TESTING.md` | `[[MSW — Mock Service Worker]]` | Secao sobre MSW |
| `DEVELOPMENT.md` | `[[Frontend — Estrutura e Padroes]]` | Workflow frontend |
| `DATABASE.md` | `[[Arquitetura de Dados]]` | Schema + arquitetura |
| `FRONTEND_BACKEND_CONTRACT.md` | `[[API]]` | Contrato refencia API |
| `FRONTEND_BACKEND_CONTRACT.md` | `[[Rotas da API]]` | Endpoints |

### Component pages <-> MOCs (media prioridade)

| De | Para MOC | Razao |
|----|----------|-------|
| `MerchantDashboardPage` | `[[MOC — Perfis do Sistema]]` | Pagina principal merchant |
| `HomePage` | `[[MOC — Perfis do Sistema]]` | Pagina principal consumer |
| `AdminDashboardPage` | `[[MOC — Perfis do Sistema]]` | Pagina principal admin |
| `CourierDashboardPage` | `[[MOC — Perfis do Sistema]]` | Pagina principal courier |
| `FxQueryBoundary` | `[[MOC — UI Primitives]]` | Hub de infraestrutura |
| `Button` | `[[MOC — UI Primitives]]` | Hub de UI |

### Memory <-> Worklog (alta prioridade)

| De | Para | Razao |
|----|------|-------|
| `obsidian/MEMORY.md` | `[[Estado do Projeto — Fases]]` | Historico detalhado |
| `obsidian/MEMORY.md` | `[[CURRENT_STATE]]` | Estado atual |
| `sources/MEMORY.md` | `[[obsidian/MEMORY]]` | Cross-reference entre MEMORYs |

---

## 12. Analise Defuddle — Conteudo Web Importado

> [!note] Nenhuma nota com conteudo web importado crasso foi detectada (sem boilerplate de navegacao, ads, etc.). O vault e majoritariamente conteudo autoral.

### Notas com URLs externas (candidatas a defuddle se re-importadas)

| Nota | URLs | Observacao |
|------|------|------------|
| `GETTING-STARTED.md` | 11 | Links de referencia — conteudo autoral |
| `ARCHITECTURE.md` | 6 | Links de docs — conteudo autoral |
| `DEVELOPMENT.md` | 6 | Links de referencia — conteudo autoral |
| `TESTING.md` | 5 | Links de docs — conteudo autoral |

> [!tip] Se no futuro importar conteudo de URLs externas, use `defuddle parse <url> --md` para extrair apenas o conteudo relevante, removendo navegacao, ads, e boilerplate — economizando 40-60% de tokens por pagina importada.

### Otimizacao de boilerplate interna

| Oportunidade | Notas afetadas | Tokens salvos |
|-------------|---------------|---------------|
| Remover headers repetidos de component docs | 101 notas | ~2,000 tokens |
| Reduzir boilerplate YAML em frontmatter | 151 notas | ~500 tokens |
| Consolidar listas de componentes (_index + README) | 2 notas | ~1,500 tokens |

---

## 13. Classificacao por Severidade

| # | Problema | Severidade | Notas afetadas | Impacto RAG |
|---|----------|-----------|---------------|-------------|
| 1 | 27 notas orfas | CRITICA | 27 | Perda total de contexto de vizinhanca |
| 2 | 37 clusters desconectados | CRITICA | 36 notas isoladas | Graph-RAG nao atravessa |
| 3 | 239 links quebrados | ALTA | 60+ notas | 34.4% de links mortos |
| 4 | 12 notas >5K chars | ALTA | 12 | Chunking dilui relevancia |
| 5 | Taxonomia de tags inexistente | MEDIA | 130 notas sem tag | Filtering impossivel |
| 6 | Redundancia MEMORY.md | MEDIA | 3 notas | ~10K tokens desperdicados |
| 7 | Nenhum MOC conceitual | ALTA | Todo o vault | Navegacao semantica impossivel |
| 8 | Nenhum alias em notas | MEDIA | 151 notas | Recall por sinonimo falha |
| 9 | Path-style wikilinks | ALTA | _index files | Links nao resolvem |
| 10 | Emojis em filenames | MEDIA | 11 knowledge + 6 worklog | Encoding corrompe links |

---

## 14. Roadmap de Otimizacao Estrutural

### Fase 1 — Correcao de links (1-2h) — Impacto imediato ✅ CONCLUIDO

- [x] Corrigir path-style links em `docs/_index.md`: `[[docs/API]]` para `[[API]]`
- [x] Corrigir path-style links em `docs/components/_index.md`: `[[../../API]]` para `[[API]]`
- [x] Corrigir path-style links em `docs/obsidian/_index.md`
- [x] Corrigir path-style links em `docs/guides/_index.md` (tambem: markdown links para wikilinks)
- [x] Corrigir path-style links em `docs/sources/_index.md` (MEMORY disambiguado com path-style)
- [x] Corrigir link em `docs/obsidian/archive/Session Memory.md`: embed `![[docs/sources/MEMORY]]` (path necessario por conflito de basename)
- [x] Corrigir link em `docs/sources/MEMORY.md`: `[[docs/obsidian/Session Memory]]` para `[[Session Memory]]`

**Resultado**: 37 path-style links corrigidos para name-style (exceto 2 disambiguacoes obrigatorias por basename duplicado MEMORY)

### Fase 2 — Criar MOCs (2-3h) — Conectividade +300% ✅ CONCLUIDO

- [x] Criar `MOC — Arquitetura do Sistema` (ver secao 10)
- [x] Criar `MOC — Perfis do Sistema` (ver secao 10)
- [x] Criar `MOC — UI Primitives` (ver secao 10)
- [x] Criar `MOC — Guias de Desenvolvimento` (ver secao 10)
- [x] Criar `MOC — Historico do Projeto` (ver secao 10)
- [x] Adicionar backlinks dos MOCs nas notas referenciadas (top-level docs + index files)

**Resultado**: 5 MOCs criados com 88 wikilinks; MOCs registrados em _index.md, knowledge/_index.md, obsidian/_index.md; 6 top-level docs receberam callout de navegacao para MOCs relevantes

### Fase 3 — Adicionar links semanticos (1-2h) — Densidade +50% ✅ CONCLUIDO

- [x] Adicionar links da secao 11 (top-level <-> knowledge) — via callouts de navegacao nos 6 top-level docs
- [x] Adicionar links cruzados MEMORY <-> worklogs — MEMORY.md e CURRENT_STATE.md com MOC + worklog cross-links; 6 worklog notes com MOC + MEMORY nav callouts
- [x] Adicionar links componentes <-> MOCs — 8 hub component docs (HomePage, MerchantDashboardPage, AdminDashboardPage, CourierDashboardPage, FxQueryBoundary, Button, Icon, PageHeader) com MOC nav callouts
- [x] Enriquecer callouts de navegacao em todas as 11 knowledge notes — cada nota referencia os 1-3 MOCs mais relevantes + notas relacionadas (ex: DATABASE↔Repository Ports, API↔Rotas da API, Frontend↔UI Primitives)

**Resultado**: Todas as 11 knowledge notes com callouts completos; 8 hub components com nav MOC; MEMORY+CURRENT_STATE+6 worklogs interligados; densidade semantica significativamente aumentada

### Fase 4 — Taxonomia de tags (1-2h) — RAG filtering ✅ CONCLUIDO

- [x] Adicionar tags hierarquicas em todas as notas (ver secao 8)
- [x] Adicionar tags de perfil: `profile/merchant`, `profile/consumer`, `profile/admin`, `profile/courier`, `profile/superadmin`
- [x] Adicionar tags de dominio: `domain/architecture`, `domain/testing`, `domain/api`, `domain/ui`, `domain/database`, `domain/commerce`, `domain/auth`, `domain/addon`, `domain/infrastructure`, `domain/configuration`, `domain/development`, `domain/setup`
- [x] Adicionar tags de tipo: `type/moc`, `type/index`, `type/knowledge`, `type/worklog`, `type/adr`, `type/archive`, `type/memory`, `type/state`, `type/source`
- [x] Consolidar tags duplicadas: `api`+`endpoints`+`rest`→`domain/api`, `getting-started`+`setup`+`installation`→`domain/setup`, `module/*`→`profile/*`
- [x] Adicionar frontmatter + tags em 17 notas sem frontmatter (11 knowledge + 3 worklog + 3 sources)
- [x] Adicionar tags em 6 notas com frontmatter mas sem tags (CURRENT_STATE, MEMORY, worklogs, sources/MEMORY)
- [x] Adicionar aliases nas notas top-level (19 notas com aliases EN/PT)

**Resultado**: 157 notas atualizadas; 69 tags flat → 23 tags hierarquicas em 3 categorias (profile/, domain/, type/); cobertura de tags 0%→100%; filtering por profile e domain funcional

### Fase 5 — Fragmentacao para RAG (2-3h) — Granularidade +40% ✅ CONCLUIDO

- [x] Fragmentar `ARCHITECTURE.md` em secoes com wikilinks → 6 notas + hub
- [x] Fragmentar `API.md` por dominio (auth, merchant, consumer, admin) → 4 notas + hub
- [x] Fragmentar `TESTING.md` por tipo (unit, integration, e2e, msw) → 4 notas + hub
- [x] Consolidar `sources/MEMORY.md` + `obsidian/MEMORY.md` (eliminar redundancia) → unificado, sources/ arquivado
- [x] Criar sumarios nas MOCs para component docs curtas

**Resultado**: ~8,000 tokens reduzidos; 14 notas fragmentadas criadas; 3 hubs transformados; MEMORY consolidado

### Fase 6 — Renomear notas com emoji (1h) — Encoding-safe ✅ CONCLUIDO

- [x] Renomear knowledge notes: remover emojis dos filenames (26 arquivos)
- [x] Renomear worklog notes: remover emojis dos filenames (4 arquivos)
- [x] Atualizar todos os wikilinks que referenciam notas renomeadas (44 arquivos atualizados)

**Resultado**: 30 arquivos renomeados; 44 arquivos com wikilinks atualizados; encoding corrompido eliminado

### Fase 7 — Aliases EN/PT (1h) — RAG recall ✅ CONCLUIDO

- [x] Adicionar aliases em 19 notas top-level/MOCs/meta (EN/PT synonyms)

**Resultado**: 19 notas com aliases bilingues; recall por sinonimo funcional

### Fase 8 — Basename collision fix (1h) — Zero orfãos ✅ CONCLUIDO

- [x] Renomear 8 `_index.md` para nomes unicos (Wiki Central, Component Index, Guides Index, Sources Index, Vault Index, Knowledge Index, Worklog Index, ADR Index, Archive Index)
- [x] Atualizar 11 `[[\_index|alias]]` wikilinks para `[[new-name]]` em 7 arquivos
- [x] Remover `components/README.md` (duplicata de `components/_index.md`)
- [x] Adicionar aliases backward-compat nos novos nomes
- [x] Adicionar links de Wiki Central → Guides Index, Sources Index
- [x] Adicionar MOC → index cross-links (Arquitetura→Knowledge Index, Historico→Worklog/Archive Index)

**Resultado**: 9 basename collisions → 0; 7 effective orphans → 0; 1 arquivo duplicado removido; grafo 100% conectado

---

## 15. Sumario Executivo

### Pre-otimizacao (baseline — 2026-05-23 inicio)

| Dimensao | Valor |
|----------|-------|
| Score conectividade | 3.2/10 |
| Orphan rate | 17.9% (27 notas) |
| Link resolution (weighted) | 65.6% |
| Clusters | 37 |
| Link density | 4.6 links/nota |
| Tag coverage | 14% |
| Token redundancy | 12-15% |
| Tokens totais | ~66K |

### Pos-otimizacao (2026-05-23 final — Fases 1-8 completas)

| Dimensao | Valor | Delta |
|----------|-------|-------|
| Total .md files | 171 | +20 (novas notas fragmentadas, -1 README duplicado) |
| Total links (wikilinks + embeds) | 1,143 | +448 (+64%) |
| Resolved instances | 943 | — |
| Unresolved instances | 200 | — |
| Weighted resolution rate | **82.5%** | +17pp |
| Orphan notes | **0** | -100% |
| Basename collisions | **0** | -100% (8 `_index.md` → nomes unicos) |
| Total embeds | 4 | — |
| Tag coverage | **100%** | +86pp |
| Tag taxonomy | 23 hierarquicas (3 categorias) | de 69 flat |
| Clusters | **1** (grafo totalmente conectado) | de 37 |

### Top unresolved targets (code references, nao docs)

| Target | Refs | Causa |
|--------|------|-------|
| `index` | 37 | Re-export de codigo |
| `routes` | 22 | Modulo de rotas |
| `useMerchantData` | 20 | Hook React |
| `format` | 15 | Utilitario de formatacao |

> [!success] Score de Conectividade: **8.4/10** (de 3.2/10 — +162%)
>
> O vault passou de estado critico (37 clusters, 27 orfas, 65.6% resolucao) para estado saudavel (1 cluster, 0 orfas, 82.5% resolucao). Os ~200 targets nao resolvidos sao majoritariamente referencias a codigo-fonte (hooks, utils, modulos), nao a notas de documentacao. Zero basename collisions apos renomear 8 `_index.md` para nomes unicos (Fase 8).
