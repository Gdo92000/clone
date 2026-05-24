---
title: MOC — Perfis do Sistema
aliases:
- Perfis MOC
- Profiles Map
- Mapa de Perfis
- System Profiles
tags:
- type/moc
created_at: 2026-05-23
updated_at: 2026-05-23
---

# MOC — Perfis do Sistema

> [!abstract] Mapa de conteúdo
> Todas as páginas e componentes organizados por perfil de usuário no Flux Delivery. Cada perfil acessa um subconjunto de rotas e layouts.

## Consumer (Client)

> [!info] Peril do consumidor final — browse de restaurantes, pedidos, pagamento, rastreamento e conta. Layout: [[ExperienceLayout]] ou [[PublicLayout]].

- [[HomePage]] · [[SearchPage]] · [[CityRestaurantsPage]]
- [[RestaurantListPage]] · [[RestaurantDetailPage]] · [[ItemDetailPage]]
- [[CartPage]] · [[CheckoutPage]] · [[OrderHistoryPage]]
- [[TrackingPage]] · [[ConsumerLoyaltyPage]] · [[FinancePage]]
- [[ProfilePage]] · [[PaymentMethodsPage]] · [[AddressBookPage]]
- [[ReviewsPage]] · [[SupportPage]] · [[OnboardingPage]]
- [[FavoritesPage]] · [[AccessHubPage]]
- [[ExperienceLayout]] · [[PublicLayout]]

## Merchant

> [!info] Perfil do lojista — gestão de catálogo, pedidos, finance, equipe e configurações. Layout: [[MerchantLayout]]. Hook de dados: `useMerchantData`.

- [[MerchantDashboardPage]] · [[MerchantOrdersPage]] · [[MerchantCatalogPage]]
- [[MerchantBranchesPage]] · [[MerchantCampaignsPage]] · [[MerchantCouponsPage]]
- [[MerchantFinancePage]] · [[MerchantAnalyticsPage]] · [[MerchantSettingsPage]]
- [[MerchantHoursPage]] · [[MerchantHolidaysPage]] · [[MerchantTeamPage]]
- [[MerchantSubscriptionPage]] · [[MerchantLoyaltyRewardsPage]]
- [[MerchantPrinterConfigPage]] · [[MerchantKitchenAutoPrintPage]]
- [[MerchantLoginPage]] · [[MerchantLayout]]
- [[MerchantStatCard]] · [[MerchantStatusBadge]]

## Admin

> [!info] Perfil administrativo — gestão de empresas e cobertura. Layout: [[DashboardLayout]].

- [[AdminDashboardPage]] · [[AdminCompaniesPage]] · [[AdminCoveragePage]]

## Superadmin

> [!info] Perfil superadmin — gestão global: usuários, planos, permissões, feature flags, finance e auditoria. Layout: [[DashboardLayout]].

- [[SuperadminDashboardPage]] · [[SuperadminLoginPage]]
- [[UsersPage]] · [[ReportsPage]] · [[NotificationsPage]]
- [[PlansPage]] · [[SubscriptionsPage]] · [[CommissionsPage]]
- [[PermissionManagementPage]] · [[BillingPage]] · [[AuditPage]]
- [[FeatureFlagsPage]] · [[CapabilitiesPage]] · [[AddonsPage]]
- [[CategoriesPage]] · [[CouponsPage]] · [[DemoDataPage]]

## Courier

> [!info] Perfil do entregador — dashboard de entregas e status. Layout: [[DashboardLayout]].

- [[CourierDashboardPage]] · [[CourierDeliveriesPage]]

## Auth e Acesso

> [!info] Componentes de autenticação e controle de acesso — login, guards de rota e feature gates.

- [[LoginPage]] · [[LoginForm]] · [[ProtectedRoute]]
- [[FeatureGate]] · [[FeatureRoute]]

## Veja Também

- [[MOC — UI Primitives]] — Componentes reutilizáveis por perfil
- [[FRONTEND_BACKEND_CONTRACT]] — Contrato de DTOs por perfil
