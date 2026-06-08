---
type: worklog
status: active
created_at: 2026-06-06
updated_at: 2026-06-06
related:
  - "[[MOC Frontend]]"
  - "[[CURRENT_STATE]]"
tags:
  - audit/mobile-first
  - priority/critical
  - domain/frontend
---

# Auditoria Mobile First — Relatório Completo

> [!danger] Resultado Global
> **O projeto NÃO é Mobile First.** Existem **5 problemas críticos**, **17 problemas de severidade alta**, e dezenas de problemas médios que bloqueiam a aprovação.

---

## 1. Resumo Executivo

| Critério de Aprovação | Status | Detalhe |
|-----------------------|--------|---------|
| Não existir overflow horizontal | **FALHA** | 2 tabelas sem wrapper, 1 decorativo com overflow potencial, navbar com `scrollbar-hide` |
| Não existir funcionalidade exclusiva de desktop | **FALHA** | MerchantLayout sem navegação mobile funcional; 2 páginas merchant sem acesso via nav |
| Não existir funcionalidade exclusiva de mobile | **PASS** | Nenhuma funcionalidade mobile-only detectada |
| Todas as rotas funcionarem em ambos | **FALHA** | 4 páginas consumer sem botão voltar; 2 páginas merchant não estão no nav; 3 constantes de rota apontam para páginas inexistentes |
| Todos os fluxos E2E passarem | **N/A** | Não executado (relatório de código) |
| Paridade funcional completa | **FALHA** | Merchant não tem navegação mobile; Consumer tem overlap de barras fixas |

---

## 2. Inventário de Funcionalidades por Perfil

### 2.1 Consumidor (25 rotas)

| # | Rota | Página | Componentes Chave | Serviços | Permissão | Mobile Nav |
|---|------|--------|-------------------|----------|-----------|------------|
| 1 | `/` | HomePage | FxNavbar, CategoryCards, FxRestaurantCard | restaurants, categories | Pública | FxBottomNavigation |
| 2 | `/restaurants` | RestaurantListPage | FxNavbar, FxFilterChips, FxRestaurantCard | restaurants, categories | Pública | FxBottomNavigation |
| 3 | `/nearby` | CityRestaurantsPage | FxPageNavbar (SEM backTo) | restaurants (geoloc) | Pública | FxBottomNavigation |
| 4 | `/restaurant/:id` | RestaurantDetailPage | Back button custom, FxProductCard, CTA fixo | restaurant, products | Pública | **OVERLAP** com bottom nav |
| 5 | `/restaurant/:id/item/:id` | ItemDetailPage | Sticky header, Checkbox additives, CTA fixo | product, additives | Pública | **OVERLAP** com bottom nav |
| 6 | `/cart` | CartPage | FxPageNavbar (backTo="/"), FxCartItem | cart | Auth | FxBottomNavigation |
| 7 | `/search` | SearchPage | FxPageNavbar (SEM backTo), FxSearchBar | search | Pública | FxBottomNavigation |
| 8 | `/login` | LoginPage | LoginForm | auth | Pública | Browser only |
| 9 | `/checkout` | CheckoutPage | FxPageNavbar (backTo=cart), FxAddressForm | orders, payments | Auth | FxBottomNavigation |
| 10 | `/tracking` | TrackingPage | FxPageNavbar (backTo="/") | orders/delivery | Auth | FxBottomNavigation |
| 11 | `/orders` | OrderHistoryPage | FxPageNavbar (SEM backTo) | orders | Auth | FxBottomNavigation |
| 12 | `/profile` | ProfilePage | FxPageNavbar (SEM backTo), Toggle switch | user, auth | Auth | FxBottomNavigation |
| 13 | `/addresses` | AddressBookPage | FxPageNavbar (backTo=profile), FxCepInput | addresses | Auth | FxBottomNavigation |
| 14 | `/access` | AccessHubPage | ExperienceLayout, AreaCards | — | Auth | ExperienceLayout back |
| 15 | `/notifications` | NotificationsPage | ExperienceLayout | notifications | Auth | ExperienceLayout back |
| 16 | `/loyalty` | ConsumerLoyaltyPage | PageHeader (SEM ExperienceLayout) | loyalty | Auth | **SEM botão voltar** |
| 17 | `/favorites` | FavoritesPage | ExperienceLayout | favorites | Auth | ExperienceLayout back |
| 18 | `/promotions` | PromotionsPage | ExperienceLayout | promotions | Auth | ExperienceLayout back |
| 19 | `/support` | SupportPage | ExperienceLayout, Form | tickets | Auth | ExperienceLayout back |
| 20 | `/finance` | FinancePage | ExperienceLayout | finance | Auth | ExperienceLayout back |
| 21 | `/reviews` | ReviewsPage | ExperienceLayout | reviews | Auth | ExperienceLayout back |
| 22 | `/onboarding` | OnboardingPage | ExperienceLayout, Steps | onboarding | Auth | ExperienceLayout back |
| 23 | `/payment-methods` | PaymentMethodsPage | ExperienceLayout | payments | Auth | ExperienceLayout back |
| 24 | `/merchant/login` | MerchantLoginPage | LoginForm | auth | Pública | Browser only |
| 25 | `/superadmin/login` | SuperadminLoginPage | LoginForm | auth | Pública | Browser only |

### 2.2 Lojista/Merchant (15 rotas)

| # | Rota | Página | Componentes Chave | Serviços | Permissão | Mobile Nav |
|---|------|--------|-------------------|----------|-----------|------------|
| 1 | `/merchant` | MerchantDashboardPage | MerchantLayout, StatCards | dashboard | roles: SO,CO,BM,ATT,FIN | **CRÍTICO: scroll horizontal** |
| 2 | `/merchant/orders` | MerchantOrdersPage | MerchantLayout, OrderCards | orders | orders.manage | **CRÍTICO** |
| 3 | `/merchant/catalog` | MerchantCatalogPage | MerchantLayout, Form, List | catalog | roles: SO,CO,BM | **CRÍTICO** |
| 4 | `/merchant/branches` | MerchantBranchesPage | MerchantLayout, Form, CEP | branches | roles: SO,CO | **CRÍTICO** |
| 5 | `/merchant/team` | MerchantTeamPage | MerchantLayout, Form, Users | team | users.manage + multi_users | **CRÍTICO** |
| 6 | `/merchant/campaigns` | MerchantCampaignsPage | MerchantLayout, Form | campaigns | roles: SO,CO,BM + campaigns | **CRÍTICO** |
| 7 | `/merchant/analytics` | MerchantAnalyticsPage | MerchantLayout, Charts | analytics | roles: SO,CO,BM + analytics | **CRÍTICO** |
| 8 | `/merchant/finance` | MerchantFinancePage | MerchantLayout, Cards | finance | finance.view + financial_suite | **CRÍTICO** |
| 9 | `/merchant/coupons` | MerchantCouponsPage | MerchantLayout, Modal, Form | coupons | roles: SO,CO,BM + coupon_automation | **CRÍTICO** |
| 10 | `/merchant/subscription` | MerchantSubscriptionPage | MerchantLayout, PlanCard | subscription | Auth | **CRÍTICO** |
| 11 | `/merchant/settings` | MerchantSettingsPage | MerchantLayout, Form, TimeInputs | settings | Auth | **CRÍTICO** |
| 12 | `/merchant/printer` | MerchantPrinterConfigPage | MerchantLayout, Form, Table | printer | Auth | **NAVEGAÇÃO OCULTA** |
| 13 | `/merchant/kitchen-auto-print` | MerchantKitchenAutoPrintPage | MerchantLayout, Table, Benefits | printer | Auth | **NAVEGAÇÃO OCULTA** |
| 14 | `/merchant/hours` | MerchantHoursPage | MerchantLayout, Form, TimeInputs | hours | Auth | **CRÍTICO** |
| 15 | `/merchant/holidays` | MerchantHolidaysPage | MerchantLayout, Form, DatePick | holidays | Auth | **CRÍTICO** |

### 2.3 Admin (3 rotas)

| # | Rota | Página | Componentes Chave | Serviços | Permissão | Mobile Nav |
|---|------|--------|-------------------|----------|-----------|------------|
| 1 | `/admin` | AdminDashboardPage | DashboardLayout, StatCards | dashboard | roles: SA,ADM | DashboardLayout sidebar |
| 2 | `/admin/companies` | AdminCompaniesPage | DashboardLayout, Cards | companies | roles: SA,ADM | DashboardLayout sidebar |
| 3 | `/admin/restaurants` | AdminRestaurantsPage | DashboardLayout, Cards, Toggle | restaurants | roles: SA,ADM,CO,BM | DashboardLayout sidebar |

### 2.4 Superadmin (16 rotas)

| # | Rota | Página | Componentes Chave | Serviços | Permissão | Mobile Nav |
|---|------|--------|-------------------|----------|-----------|------------|
| 1 | `/superadmin` | SuperadminDashboardPage | DashboardLayout, Cards | dashboard | roles: SA | DashboardLayout sidebar |
| 2 | `/superadmin/plans` | PlansPage | DashboardLayout, Form, Cards | plans | plans.manage | DashboardLayout sidebar |
| 3 | `/superadmin/capabilities` | CapabilitiesPage | DashboardLayout, Cards | capabilities | plans.manage | DashboardLayout sidebar |
| 4 | `/superadmin/addons` | AddonsPage | DashboardLayout, Form, Cards | addons | plans.manage | DashboardLayout sidebar |
| 5 | `/superadmin/subscriptions` | SubscriptionsPage | DashboardLayout, Selects | subscriptions | billing.manage | DashboardLayout sidebar |
| 6 | `/superadmin/features` | FeatureFlagsPage | DashboardLayout, Form, Matrix | features | features.manage | DashboardLayout sidebar |
| 7 | `/superadmin/billing` | BillingPage | DashboardLayout, Cards | billing | billing.manage | DashboardLayout sidebar |
| 8 | `/superadmin/users` | UsersPage | DashboardLayout, Form, Cards | users | users.manage | DashboardLayout sidebar |
| 9 | `/superadmin/audit` | AuditPage | DashboardLayout, Cards | audit | roles: SA | DashboardLayout sidebar |
| 10 | `/superadmin/permissions` | PermissionManagementPage | DashboardLayout, Matrix | permissions | roles: SA | DashboardLayout sidebar |
| 11 | `/superadmin/commissions` | CommissionsPage | DashboardLayout, InlineEdit | commissions | roles: SA | DashboardLayout sidebar |
| 12 | `/superadmin/coupons` | CouponsPage | DashboardLayout, Modal, Form | coupons | roles: SA | DashboardLayout sidebar |
| 13 | `/superadmin/categories` | CategoriesPage | DashboardLayout, Modal, Form | categories | roles: SA | DashboardLayout sidebar |
| 14 | `/superadmin/notifications` | NotificationsPage | DashboardLayout, Form | notifications | roles: SA | DashboardLayout sidebar |
| 15 | `/superadmin/reports` | ReportsPage | DashboardLayout, Cards, Export | reports | roles: SA | DashboardLayout sidebar |
| 16 | `/superadmin/demo` | DemoDataPage | DashboardLayout, Cards | demo | roles: SA | DashboardLayout sidebar |

### 2.5 Courier (2 rotas)

| # | Rota | Página | Componentes Chave | Serviços | Permissão | Mobile Nav |
|---|------|--------|-------------------|----------|-----------|------------|
| 1 | `/courier` | CourierDashboardPage | DashboardLayout, Cards | dashboard | roles: SA,COU | DashboardLayout sidebar |
| 2 | `/courier/deliveries` | CourierDeliveriesPage | DashboardLayout, Cards | deliveries | deliveries.manage | DashboardLayout sidebar |

---

## 3. Problemas Críticos (Severidade CRITICAL)

### C1 — Merchant: Sem navegação mobile funcional

| Campo | Detalhe |
|-------|---------|
| **Área** | `src/modules/merchant/components/MerchantLayout.tsx:58-77` |
| **Severidade** | CRITICAL |
| **Reprodução** | Acessar qualquer página `/merchant/*` em viewport 375px. Observar navbar horizontal com 13 itens, scrollbar oculto, sem indicadores de scroll |
| **Evidência** | `overflow-x-auto scrollbar-hide` na linha 58. 13 nav items em linha. Zero mecanismo de menu hamburger/drawer/bottom nav |
| **Causa raiz** | Rotas merchant são flat siblings (App.tsx:318-334) sem parent layout com `<Outlet />`. MerchantLayout é renderizado individualmente por cada página, sem integração com DashboardLayout |
| **Correção** | Reestruturar rotas merchant em App.tsx para usar `<Route path="/merchant" element={<DashboardLayout ... />}>` como parent. Remover MerchantLayout de cada página. Adicionar navItems incluindo printer/kitchen-auto-print |

### C2 — RestaurantDetail + ItemDetail: Overlap de barras fixas com bottom nav

| Campo | Detalhe |
|-------|---------|
| **Área** | `src/pages/RestaurantDetailPage.tsx:312-326`, `src/pages/ItemDetailPage.tsx:152-174` |
| **Severidade** | CRITICAL |
| **Reprodução** | Acessar `/restaurant/:id` ou `/restaurant/:id/item/:id` em mobile. A barra CTA fixa (z-40) sobrepõe a FxBottomNavigation (z-50). O conteúdo abaixo da CTA fica truncado |
| **Evidência** | Ambas as páginas usam `fixed bottom-0 left-0 right-0 z-40`. A PublicLayout renderiza `FxBottomNavigation` com `fixed bottom-0 z-50`. Duas barras empilhadas |
| **Causa raiz** | As páginas de detalhe não levam em conta a existência da bottom nav do layout pai. Falta de `pb-safe` e compensação para a altura da bottom nav |
| **Correção** | 1) Adicionar `bottom-[60px]` (altura da bottom nav) ao CTA fixo OU 2) Ocultar a bottom nav nessas páginas via context. 2) Adicionar `pb-safe` para dispositivos com notch |

### C3 — 4 páginas consumer sem botão voltar

| Campo | Detalhe |
|-------|---------|
| **Área** | OrderHistoryPage, ProfilePage, SearchPage, CityRestaurantsPage |
| **Severidade** | CRITICAL |
| **Reprodução** | Acessar `/orders`, `/profile`, `/search`, `/nearby` em mobile. Nenhum botão voltar visível. O FxPageNavbar sem `backTo` não renderiza botão |
| **Evidência** | `FxPageNavbar.tsx:26-34` — back button condicional ao `backTo` prop. OrderHistoryPage:26, ProfilePage:72, SearchPage:27, CityRestaurantsPage:43 não passam `backTo` |
| **Causa raiz** | Ausência do prop `backTo` nas invocações do FxPageNavbar |
| **Correção** | Adicionar `backTo` apropriadamente em cada página. Ex: OrderHistoryPage `backTo="/"`, ProfilePage `backTo="/"`, SearchPage `backTo="/"`, CityRestaurantsPage `backTo="/"` |

### C4 — Touch targets criticamente abaixo de 44x44px

| Campo | Detalhe |
|-------|---------|
| **Área** | Múltiplos arquivos (ver tabela abaixo) |
| **Severidade** | CRITICAL |
| **Reprodução** | Em mobile, tentar tocar em botões de ação (delete, edit, archive, toggle) — hit area insuficiente causa toques imprecisos |
| **Evidência** | Veja tabela consolidada de touch targets na seção 5 |
| **Causa raiz** | 1) Botões ícone com `p-1`/`p-2` (24-32px). 2) Toggle switches com `h-5`/`h-6` (20-24px). 3) Checkboxes nativos `w-4 h-4` (16px). 4) `Button size="sm"` = `h-9` (36px) |
| **Correção** | 1) Adicionar `min-w-[44px] min-h-[44px]` a todos os botões ícone. 2) Aumentar toggle switches para `h-7 w-12` mínimo com padding de hit area. 3) Substituir checkboxes nativos por toggle switches com touch area adequada. 4) Revisar `Button size="sm"` para `h-11` (44px) |

### C5 — MerchantCoupons modal e CategoriesPage modal sem scroll constraint

| Campo | Detalhe |
|-------|---------|
| **Área** | `src/modules/superadmin/pages/CouponsPage.tsx:78-126`, `src/modules/superadmin/pages/CategoriesPage.tsx:77-101`, `src/modules/merchant/pages/MerchantCouponsPage.tsx:107-163` |
| **Severidade** | CRITICAL |
| **Reprodução** | Em mobile (375px), abrir modal de criação de cupom/categoria. Com teclado virtual aberto, os botões Salvar/Cancelar ficam inacessíveis |
| **Evidência** | Modais usam `fixed inset-0 z-50` com `max-w-lg mx-4`, mas sem `max-h-[90vh] overflow-y-auto` no container interno |
| **Causa raiz** | Modais customizados inline (não usam `<Modal>` ou `<BottomSheet>` que já tratam isso) |
| **Correção** | Refatorar modais para usar `<Modal>` ou `<BottomSheet>`. No mínimo, adicionar `max-h-[90vh] overflow-y-auto` ao container interno |

---

## 4. Problemas de Severidade Alta (HIGH)

| # | Área | Arquivo:Linha | Problema | Correção Recomendada |
|---|------|---------------|----------|---------------------|
| H1 | Merchant Nav | MerchantLayout.tsx:15-29 | 2 páginas (Printer, Kitchen-Auto-Print) não estão nos nav items | Adicionar ao navItems ou criar submenu "Mais" |
| H2 | Merchant Nav | MerchantLayout.tsx:47 | Info da empresa `hidden md:block` — invisível no mobile | Mostrar versão compacta no mobile |
| H3 | Merchant Coupling | MerchantKitchenAutoPrintPage.tsx:133 | `window.location.href` hard navigation em vez de React Router | Substituir por `<Link>` ou `useNavigate()` |
| H4 | Hover-only | ~80+ elementos interativos | `hover:` sem `active:` ou `focus-visible:` — zero feedback no touch | Adicionar `active:` correspondente a cada `hover:` |
| H5 | Tabelas | MerchantLoyaltyRewardsPage.tsx:83 | Tabela 5 colunas sem `overflow-x-auto` | Adicionar wrapper ou converter para cards no mobile |
| H6 | Tabelas | EnterpriseAuditPage.tsx:14 | Tabela 4 colunas sem `overflow-x-auto` | Adicionar wrapper ou converter para cards no mobile |
| H7 | Fixed Bottom | RestaurantDetailPage.tsx:312, ItemDetailPage.tsx:152 | Barra CTA sem `pb-safe` | Adicionar `pb-safe` para iPhones com notch |
| H8 | Checkbox | ItemDetailPage.tsx:121 | Checkbox `w-5 h-5` (20px) | Envolver em label com `min-h-[44px]` |
| H9 | Toggle | ProfilePage.tsx:113, RestaurantListPage.tsx:264, AdminRestaurantsPage.tsx:65, CategoriesPage.tsx:117 | Toggles com 20-28px de altura | Aumentar para mínimo 44px com padding |
| H10 | Nav Location | FxNavbar.tsx:82 | `max-w-[70px]` no mobile trunca nome da cidade | Aumentar para `max-w-[120px]` ou usar texto truncado com title |
| H11 | Search Overlay | FxNavbar.tsx:143-163 | Overlay de busca sem dismiss (no outside-click, no ESC) | Adicionar listener de ESC e outside-click |
| H12 | Input Type | CheckoutPage.tsx:44 | Campo monetário com `type="text"` sem `inputMode` | Adicionar `inputMode="decimal"` |
| H13 | Label Assoc | CheckoutPage.tsx:43-44 | Label sem `htmlFor`/`id` | Adicionar `htmlFor` + `id` |
| H14 | Loyalty Page | ConsumerLoyaltyPage.tsx | Não usa ExperienceLayout — sem back button | Envolver em ExperienceLayout ou adicionar back nav |
| H15 | Custom Modal | MerchantCouponsPage.tsx:107-108, LocationSelector.tsx:119-154 | Modais customizados sem body scroll lock, ESC, focus trap | Refatorar para usar `<Modal>` ou `<BottomSheet>` |
| H16 | Routes | App.tsx | 3 constantes de rota apontam para páginas inexistentes (`/admin/login`, `/courier/login`, `/admin/coverage`) | Criar páginas ou remover constantes |
| H17 | Bottom Nav | FxBottomNavigation.tsx:40,53 | Itens ~36-40px altura; label `text-[10px]` ilegível | Aumentar altura para 44px; aumentar fonte para `text-xs` |

---

## 5. Touch Targets — Consolidado

### 5.1 Botões Ícone (< 44x44px)

| Arquivo | Linha | Elemento | Área Estimada | Mínimo |
|---------|-------|----------|---------------|--------|
| FxCartItem.tsx | 44 | Remove button | ~24px | 44px |
| MerchantLoyaltyRewardsPage.tsx | 115, 118 | Edit/Delete | ~28px | 44px |
| MerchantCouponsPage.tsx | 191 | Delete | ~32px | 44px |
| CouponsPage.tsx (SA) | 153 | Delete | ~32px | 44px |
| CategoriesPage.tsx | 116, 120 | Edit/Delete | ~32px | 44px |
| CommissionsPage.tsx | 95 | Edit | ~32px | 44px |
| PlansPage.tsx | 125 | Archive | ~32px | 44px |
| AddressBookPage.tsx | 138, 145 | Edit/Delete | ~36px | 44px |
| LocationBanner.tsx | 234, 242 | Change/Dismiss | ~32px | 44px |

### 5.2 Toggle Switches (< 44px altura)

| Arquivo | Linha | Elemento | Dimensão | Mínimo |
|---------|-------|----------|----------|--------|
| AdminRestaurantsPage.tsx | 65 | Status toggle | 24x44px | 44x44px |
| CategoriesPage.tsx | 117 | Active toggle | 20x40px | 44x44px |
| ProfilePage.tsx | 113 | Notification toggle | 28x48px | 44x44px |
| RestaurantListPage.tsx | 264 | Filter toggle | 24x44px | 44x44px |

### 5.3 Checkboxes (< 44px)

| Arquivo | Linha | Elemento | Dimensão | Mínimo |
|---------|-------|----------|----------|--------|
| ItemDetailPage.tsx | 121 | Additive checkbox | 20x20px | 44x44px |
| CouponsPage.tsx (SA) | 72 | Show inactive | 16x16px | 44x44px |
| PlansPage.tsx | 112 | Show inactive | 16x16px | 44x44px |

### 5.4 Botões `size="sm"` (< 44px altura)

| Arquivo | Linha | Elemento | Altura | Mínimo |
|---------|-------|----------|--------|--------|
| CourierDeliveriesPage.tsx | 64 | Advance | 36px | 44px |
| UsersPage.tsx | 109 | Toggle | 36px | 44px |
| CommissionsPage.tsx | 145-146 | Save/Cancel | 36px | 44px |
| CouponsPage.tsx (SA) | 151-152 | Pause/Edit | 36px | 44px |
| ReportsPage.tsx | 56-59 | Export | 36px | 44px |
| MerchantTeamPage.tsx | 73-74 | Name/Email inputs | 40px | 44px |

### 5.5 Pills/Badges Interativos (< 28px altura)

| Arquivo | Linha | Elemento | Altura | Mínimo |
|---------|-------|----------|--------|--------|
| PermissionManagementPage.tsx | 70-71 | Permission toggle | ~28px | 44px |
| SubscriptionsPage.tsx | 125 | Addon toggle | ~28px | 44px |
| PlansPage.tsx | 144 | Feature toggle | ~28px | 44px |
| BillingPage.tsx | 52 | Block company | ~36px | 44px |
| PermissionManagementPage.tsx | 31-32 | Role selector | ~36px | 44px |
| NotificationsPage.tsx | 26-27 | Tab buttons | ~36px | 44px |

---

## 6. Hover-Only Patterns — Resumo Quantitativo

| Perfil | Arquivos Afetados | Instâncias `hover:` sem `active:` |
|--------|-------------------|----------------------------------|
| Consumer | 8 páginas + 4 componentes | ~30 |
| Merchant | 6 páginas + MerchantLayout | ~15 |
| Superadmin | 7 páginas + DashboardLayout | ~18 |
| Admin | 1 página (AdminRestaurantsPage toggle) | 1 |
| Courier | 0 | 0 |
| **Total** | **26 arquivos** | **~64+** |

> [!note] Nenhum uso de eventos mouse-only (`onContextMenu`, `onMouseEnter`, etc.) foi encontrado — positivo.

---

## 7. Grid Não-Responsivo (Sem breakpoint para mobile)

| Arquivo | Linha | Padrão | Problema |
|---------|-------|--------|----------|
| MerchantBranchesPage.tsx | 212, 233, 254 | `grid-cols-[3fr_1fr]`, `grid-cols-[2fr_1fr]` | Sempre 2 colunas |
| MerchantCouponsPage.tsx | 110 | `grid-cols-2` | Sempre 2 colunas no modal |
| MerchantPrinterConfigPage.tsx | 72 | `grid-cols-2` | IP+Port sempre lado a lado |
| MerchantHolidaysPage.tsx | 247 | `grid-cols-[1fr_1fr]` | Sempre 2 colunas |
| AddressBookPage.tsx | 212, 229, 255 | `grid-cols-[2fr_1fr]` | Sempre 2 colunas |
| CouponsPage.tsx (SA) | 81 | `grid-cols-2` no modal | Sempre 2 colunas |
| FavoritesPage.tsx | 16 | `md:grid-cols-3` sem `sm:grid-cols-2` | Pula de 1 para 3 colunas |
| PromotionsPage.tsx | 16 | `md:grid-cols-3` sem `sm:grid-cols-2` | Pula de 1 para 3 colunas |
| FinancePage.tsx | 24 | `md:grid-cols-3` sem `sm:grid-cols-2` | Pula de 1 para 3 colunas |

---

## 8. Modais — Auditoria

| Arquivo | Usa Modal/BottomSheet? | Body Scroll Lock | ESC to Close | Focus Trap | max-h | pb-safe | Mobile OK? |
|---------|------------------------|------------------|-------------|------------|-------|---------|------------|
| `Modal.tsx` (componente) | Sim | Sim | Sim | Parcial | Sim (90vh) | N/A | PARCIAL |
| `BottomSheet.tsx` (componente) | Sim | Sim | Sim | Parcial | Sim | Sim | SIM |
| MerchantCouponsPage.tsx:107 | Não (inline) | **Não** | **Não** | **Não** | **Não** | N/A | **FALHA** |
| CategoriesPage.tsx:77 | Não (inline) | **Não** | **Não** | **Não** | **Não** | N/A | **FALHA** |
| CouponsPage.tsx (SA):78 | Não (inline) | **Não** | **Não** | **Não** | **Não** | N/A | **FALHA** |
| MerchantLoyaltyRewardsPage.tsx:131 | Não (inline) | **Não** | **Não** | **Não** | **Não** | N/A | **FALHA** |
| LocationSelector.tsx:119 | Não (inline) | **Não** | **Não** | **Não** | **Não** | N/A | **FALHA** |

---

## 9. Formulários — Auditoria de Usabilidade Mobile

| Página | Labels Associados? | inputMode Correto? | Touch Targets OK? | Scroll Constraint? | Status |
|--------|--------------------|--------------------|--------------------|--------------------|--------|
| CheckoutPage | **Não** (sem htmlFor) | **Não** (text p/ dinheiro) | h-11 (44px) OK | N/A | FALHA |
| SupportPage | **Parcial** (sr-only) | N/A | h-10 (40px) | N/A | FALHA |
| LoginForm | Parcial (implícito) | email OK | h-11 OK | N/A | PARCIAL |
| MerchantCatalogPage | Sim | decimal OK | h-10 (40px) | N/A | OK |
| MerchantBranchesPage | Sim | N/A | Grid 2-col sem break | N/A | PARCIAL |
| MerchantSettingsPage | Sim | numeric/decimal OK | h-10 (40px) | N/A | OK |
| MerchantHoursPage | Sim | time OK | Time row sem wrap | N/A | PARCIAL |
| MerchantHolidaysPage | Sim | date OK | Grid 2-col sem break | N/A | PARCIAL |
| MerchantTeamPage | **Não** (placeholder only) | N/A | h-10 (40px) | N/A | FALHA |
| PlansPage | Sim | N/A | Checkbox 16px | N/A | FALHA |
| AddonsPage | Sim | N/A | h-10 (40px) | N/A | PARCIAL |
| SubscriptionsPage | **Não** (selects sem label) | N/A | Toggle pills 28px | N/A | FALHA |
| FeatureFlagsPage | Sim | N/A | Native checkbox 16px | N/A | FALHA |

---

## 10. Rotas Orfãs / Problemas de Roteamento

| Problema | Arquivo | Detalhe |
|----------|---------|---------|
| `/admin/login` — rota inexistente | routes.ts | Constante definida, nenhuma página, nenhuma rota em App.tsx |
| `/courier/login` — rota inexistente | routes.ts | Constante definida, nenhuma página, nenhuma rota em App.tsx |
| `/admin/coverage` — rota inexistente | routes.ts + nav items | Constante definida + link na sidebar, nenhuma página |
| `/loyalty` — hardcoded | App.tsx:281 | Não usa ROUTES constant (constante não existe) |
| `/superadmin/permissions` — hardcoded | App.tsx:302 | Não usa ROUTES constant |
| `/admin/restaurants` — hardcoded | App.tsx:315 | Não usa ROUTES constant |
| `/merchant/printer` — hardcoded | App.tsx:329 | Não usa ROUTES constant |
| `/merchant/kitchen-auto-print` — hardcoded | App.tsx:330 | Não usa ROUTES constant |
| GuestRoute — não usado | App.tsx | Importado mas nunca aplicado a nenhuma rota |
| 7 páginas sem rota | modules/enterprise, merchant, courier, dev | MerchantLoyaltyRewardsPage, CourierRoutePage, 4x Enterprise, FlagsDebug |

---

## 11. Matriz de Paridade Desktop x Mobile

### 11.1 Consumidor

| Funcionalidade | Desktop | Mobile | Status | Divergência |
|---------------|---------|--------|--------|-------------|
| Home / Browse | OK | OK | **Paridade** | — |
| Busca de restaurantes | OK | OK | **Paridade** | Hover cards sem feedback touch |
| Detalhe do restaurante | OK | **FALHA** | **Divergência** | CTA fixo sobrepõe bottom nav; sem pb-safe |
| Detalhe do item | OK | **FALHA** | **Divergência** | CTA fixo sobrepõe bottom nav; checkbox 20px; sem pb-safe |
| Carrinho | OK | OK | **Paridade** | — |
| Checkout | OK | **FALHA** | **Divergência** | Label sem associação; campo dinheiro sem inputMode |
| Acompanhar pedido | OK | OK | **Paridade** | Botão "Contatar" size=sm |
| Histórico de pedidos | OK | **FALHA** | **Divergência** | Sem botão voltar |
| Perfil | OK | **FALHA** | **Divergência** | Sem botão voltar; toggle 28px |
| Endereços | OK | PARCIAL | **Divergência** | Grid 2-col sem break; botões ~36px |
| Busca | OK | **FALHA** | **Divergência** | Sem botão voltar |
| Perto de você | OK | **FALHA** | **Divergência** | Sem botão voltar; radius buttons 36px |
| Hub de acesso | OK | OK | **Paridade** | — |
| Notificações | OK | OK | **Paridade** | — |
| Loyalty | OK | **FALHA** | **Divergência** | Sem ExperienceLayout (sem back); decorative icon overflow |
| Favoritos | OK | OK | **Paridade** | Grid pula de 1→3 colunas |
| Promoções | OK | OK | **Paridade** | Grid pula de 1→3 colunas |
| Suporte | OK | **FALHA** | **Divergência** | Label sr-only; input 40px |
| Financeiro | OK | OK | **Paridade** | — |
| Avaliações | OK | OK | **Paridade** | — |
| Onboarding | OK | OK | **Paridade** | — |
| Métodos de pagamento | OK | OK | **Paridade** | Hover sem active |
| Login | OK | PARCIAL | **Divergência** | Sem toggle de senha; sem back nav |

### 11.2 Lojista/Merchant

| Funcionalidade | Desktop | Mobile | Status | Divergência |
|---------------|---------|--------|--------|-------------|
| Dashboard | OK | **FALHA** | **Divergência** | Nav horizontal com 13 itens, scrollbar oculto, sem affordance |
| Pedidos | OK | **FALHA** | **Divergência** | Nav inacessível; actions no header podem overflow |
| Catálogo | OK | **FALHA** | **Divergência** | Nav inacessível |
| Filiais | OK | **FALHA** | **Divergência** | Nav inacessível; grid 2-col sem break |
| Equipe | OK | **FALHA** | **Divergência** | Nav inacessível; inputs sem label; feature gated |
| Campanhas | OK | **FALHA** | **Divergência** | Nav inacessível; feature gated |
| Analytics | OK | **FALHA** | **Divergência** | Nav inacessível; feature gated |
| Financeiro | OK | **FALHA** | **Divergência** | Nav inacessível; feature gated |
| Cupons | OK | **FALHA** | **Divergência** | Nav inacessível; modal sem scroll; grid 2-col no modal; feature gated |
| Assinatura | OK | **FALHA** | **Divergência** | Nav inacessível |
| Configurações | OK | **FALHA** | **Divergência** | Nav inacessível |
| Impressão | **OCULTO** | **OCULTO** | **Divergência** | Não está no nav items — acessível só por URL direta |
| Auto-impressão | **OCULTO** | **OCULTO** | **Divergência** | Não está no nav items; hard navigation |
| Horários | OK | **FALHA** | **Divergência** | Nav inacessível; time inputs sem flex-wrap |
| Feriados | OK | **FALHA** | **Divergência** | Nav inacessível; grid 2-col sem break; buttons sem wrap |

### 11.3 Admin

| Funcionalidade | Desktop | Mobile | Status | Divergência |
|---------------|---------|--------|--------|-------------|
| Dashboard | OK | OK | **Paridade** | — |
| Empresas | OK | OK | **Paridade** | — |
| Restaurantes | OK | **FALHA** | **Divergência** | Toggle 24px; sem hover feedback touch |
| Cidades (coverage) | **INEXISTENTE** | **INEXISTENTE** | **Paridade** (ambos falham) | Link na sidebar aponta para página que não existe |

### 11.4 Superadmin

| Funcionalidade | Desktop | Mobile | Status | Divergência |
|---------------|---------|--------|--------|-------------|
| Dashboard | OK | OK | **Paridade** | Hover sem active |
| Planos | OK | **FALHA** | **Divergência** | Checkbox 16px; pills 28px; archive button 32px |
| Capacidades | OK | OK | **Paridade** | Pills não-interativas |
| Addons | OK | PARCIAL | **Divergência** | Inputs 40px |
| Assinaturas | OK | **FALHA** | **Divergência** | Toggles 28px; selects sem label |
| Feature Flags | OK | **FALHA** | **Divergência** | Checkbox nativo 16px; form longo sem collapse |
| Billing | OK | **FALHA** | **Divergência** | Block button 36px |
| Usuários | OK | **FALHA** | **Divergência** | Toggle 36px; role select 40px |
| Audit | OK | PARCIAL | **Divergência** | Metadata string pode overflow |
| Permissões | OK | **FALHA** | **Divergência** | Toggles 28px; role buttons 36px; text 10px; hover-only |
| Comissões | OK | **FALHA** | **Divergência** | Edit 32px; input w-20 h-8; buttons 36px |
| Cupons | OK | **FALHA** | **Divergência** | Checkbox 16px; modal grid-cols-2; delete 32px; buttons 36px |
| Categorias | OK | **FALHA** | **Divergência** | Toggle 20px; edit/delete 32px; modal sem max-h |
| Notificações | OK | PARCIAL | **Divergência** | Tabs 36px; history squeeze |
| Relatórios | OK | PARCIAL | **Divergência** | Header buttons 36px; hover-only export cards |
| Demo Data | OK | OK | **Paridade** | — |

### 11.5 Courier

| Funcionalidade | Desktop | Mobile | Status | Divergência |
|---------------|---------|--------|--------|-------------|
| Dashboard | OK | OK | **Paridade** | — |
| Entregas | OK | **FALHA** | **Divergência** | Botão "Avançar" 36px — crítico para uso em campo |

---

## 12. Scorecard por Perfil

| Perfil | Rotas | Paridade OK | Paridade | Divergência | % Aprovação |
|--------|-------|-------------|----------|-------------|-------------|
| Consumidor | 25 | 10 | 40% | 15 | 40% |
| Merchant | 15 | 0 | 0% | 15 | **0%** |
| Admin | 3 | 2 | 67% | 1 | 67% |
| Superadmin | 16 | 3 | 19% | 13 | 19% |
| Courier | 2 | 1 | 50% | 1 | 50% |
| **Total** | **61** | **16** | **26%** | **45** | **26%** |

---

## 13. Pontos Positivos

| Área | Detalhe |
|------|--------|
| Mobile-first breakpoints | TODOS os grids usam base mobile-first (1 col) com breakpoints ascendentes |
| Zero eventos mouse-only | Nenhum `onMouseEnter`, `onDoubleClick`, etc. |
| BottomSheet | Componente exemplar: bottom-up no mobile, centered no desktop, drag handle |
| Safe area insets | `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe` definidos no CSS |
| `100dvh` | Usa dynamic viewport height — correto para mobile |
| `@media (hover: hover)` | Smooth scroll apenas em dispositivos com hover |
| `prefers-reduced-motion` | Respeita acessibilidade de movimento |
| Body `overflow-x: hidden` | Previne scroll horizontal no body |
| DashboardLayout | Sidebar + hamburger + overlay — padrão correto |
| PublicLayout | Bottom nav + padding compensado — padrão correto |
| No mouse-only flows | Nenhum fluxo depende exclusivamente de hover ou mouse |

---

## 14. Plano de Correção Priorizado

### Fase 1 — Críticos (Semana 1) — Bloqueadores de Mobile First

| # | Ação | Arquivos | Impacto | Esforço |
|---|------|----------|---------|---------|
| 1 | Reestruturar rotas merchant para usar DashboardLayout | App.tsx, MerchantLayout.tsx, 15 páginas merchant | **Todo perfil merchant** | Alto |
| 2 | Remover MerchantLayout de cada página merchant | 15 arquivos merchant/pages/*.tsx | Navegação mobile | Médio |
| 3 | Corrigir overlap CTA fixo + bottom nav | RestaurantDetailPage.tsx, ItemDetailPage.tsx | 2 páginas consumer | Baixo |
| 4 | Adicionar backTo a 4 páginas consumer | OrderHistoryPage, ProfilePage, SearchPage, CityRestaurantsPage | 4 páginas consumer | Baixo |
| 5 | Corrigir modais sem scroll constraint | 5 modais inline | 5 páginas | Médio |

### Fase 2 — Touch Targets (Semana 2) — Acessibilidade

| # | Ação | Arquivos | Impacto | Esforço |
|---|------|----------|---------|---------|
| 6 | Criar `FxIconButton` com `min-w-[44px] min-h-[44px]` | Novo componente + ~15 páginas | ~15 botões ícone | Médio |
| 7 | Revisar `Button size="sm"` para 44px | packages/ui FxButton.classes.ts + 6 páginas | ~10 botões | Baixo |
| 8 | Revisar toggle switches para 44px | 4 páginas (Admin, Categories, Profile, RestaurantList) | 4 componentes | Médio |
| 9 | Substituir checkboxes nativos por toggles | 3 páginas (ItemDetail, Coupons, Plans) | 3 componentes | Médio |
| 10 | Revisar interactive pills para 44px | 3 páginas (Permissions, Subscriptions, Plans) | ~6 pills | Baixo |

### Fase 3 — Hover/Touch Feedback (Semana 3) — UX Mobile

| # | Ação | Arquivos | Impacto | Esforço |
|---|------|----------|---------|---------|
| 11 | Adicionar `active:` a todos `hover:` interativos | ~26 arquivos, ~64+ instâncias | Toda superfície touch | Alto |
| 12 | Adicionar `focus-visible:` para keyboard nav | Mesmos 26 arquivos | Acessibilidade keyboard | Alto |
| 13 | Adicionar `scroll-snap-type` a carrosséis | HomePage, RestaurantListPage, RestaurantDetailPage | 3 carrosséis | Baixo |

### Fase 4 — Formulários e Grids (Semana 4) — Usabilidade

| # | Ação | Arquivos | Impacto | Esforço |
|---|------|----------|---------|---------|
| 14 | Corrigir grids 2-col sem breakpoint mobile | 9 arquivos (seção 7 acima) | 9 formulários | Médio |
| 15 | Associar labels com htmlFor/id | CheckoutPage, SupportPage, MerchantTeamPage, SubscriptionsPage | 4 formulários | Baixo |
| 16 | Adicionar inputMode correto | CheckoutPage (decimal) | 1 formulário | Baixo |
| 17 | Adicionar toggle de senha no LoginForm | LoginForm.tsx | 3 login pages | Baixo |
| 18 | Adicionar dismiss ao mobile search overlay | FxNavbar.tsx | 1 componente | Baixo |
| 19 | Corrigir FxBottomNavigation height + font | FxBottomNavigation.tsx | Bottom nav global | Baixo |

### Fase 5 — Rotas e Arquitetura (Semana 5) — Integridade

| # | Ação | Arquivos | Impacto | Esforço |
|---|------|----------|---------|---------|
| 20 | Criar páginas para rotas inexistentes | /admin/login, /courier/login, /admin/coverage | 3 rotas | Médio |
| 21 | Mover hardcoded paths para ROUTES constants | App.tsx + routes.ts | 6 rotas | Baixo |
| 22 | Integrar ConsumerLoyaltyPage ao ExperienceLayout | ConsumerLoyaltyPage.tsx | 1 página | Baixo |
| 23 | Adicionar páginas printer/kitchen-auto-print ao merchant nav | MerchantLayout ou novo DashboardLayout navItems | 2 páginas | Baixo |
| 24 | Remover GuestRoute import não usado ou aplicar | App.tsx | Clean code | Baixo |
| 25 | Decidir destino das 7 páginas orphan | Enterprise module, MerchantLoyaltyRewardsPage, etc. | Dead code | Médio |

---

## 15. Critério de Aprovação — Status Final

| Critério | Status | Bloqueios |
|----------|--------|-----------|
| Não existir overflow horizontal | **REPROVADO** | 2 tabelas sem wrapper; 1 decorative icon com overflow |
| Não existir funcionalidade exclusiva de desktop | **REPROVADO** | Merchant: 15 rotas sem navegação mobile funcional |
| Não existir funcionalidade exclusiva de mobile | **APROVADO** | Nenhuma funcionalidade mobile-only |
| Todas as rotas funcionarem em ambos | **REPROVADO** | 4 consumer sem back nav; 2 merchant não no nav; 3 rotas inexistentes |
| Todos os fluxos E2E passarem | **PENDENTE** | Requer execução após correções |
| Paridade funcional completa | **REPROVADO** | Merchant 0%; Superadmin 19%; Consumer 40% |

> [!danger] Veredicto
> **PROJETO REPROVADO** como Mobile First. Aprovação condicionada à execução das 5 fases do plano de correção. Estimativa: 5 semanas.
