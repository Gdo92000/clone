---
title: MOC — UI Primitives
aliases:
- UI Primitives MOC
- Componentes UI Map
- Mapa de Componentes
- UI MOC
tags:
- type/moc
- domain/ui
created_at: 2026-05-23
updated_at: 2026-05-23
---

# MOC — UI Primitives

> [!abstract] Mapa de conteúdo
> Componentes React reutilizáveis do Flux Delivery, organizados por categoria.
> Todos localizam-se em `src/components/ui/` ou `src/components/` e seguem o design system `@fluxds/ui`.

## Layout

> [!info] Componentes de estrutura visual — definem esqueleto, navegação e containers de página.

- [[PublicLayout]] · [[DashboardLayout]] · [[ExperienceLayout]]
- [[MerchantLayout]] · [[FxNavbar]] · [[FxBottomNavigation]]
- [[FxPageNavbar]] · [[PageHeader]]

## Data Display

> [!info] Componentes de apresentação de dados — cards, badges, imagens, listas e indicadores visuais.

- [[FxRestaurantCard]] · [[FxProductCard]] · [[FxCartItem]]
- [[FxImage]] · [[FxPriceTag]] · [[FxDeliveryBadge]]
- [[FxOrderStatus]] · [[FxOrderSummary]] · [[FxFilterChips]]
- [[FxPaymentMethod]] · [[FxSearchBar]] · [[Skeleton]]
- [[MerchantStatCard]] · [[MerchantStatusBadge]]

## Input e Interação

> [!info] Componentes interativos — botões, formulários, seletores, inputs e toggles.

- [[Button]] · [[Icon]] · [[FxQuantitySelector]]
- [[FxAddressForm]] · [[FxCepInput]] · [[AddressAutocomplete]]
- [[AddressMap]] · [[LocationSelector]] · [[ThemeToggle]]

## Navegação

> [!info] Componentes de navegação — barras, menus e hooks de configuração de rotas.

- [[FxBottomNavigation]] · [[FxNavbar]] · [[FxPageNavbar]]
- [[useNavItems]]

## Infraestrutura

> [!info] Componentes de infraestrutura — providers, error boundaries, guards de rota e contexto global.

- [[App]] · [[main]] · [[ErrorBoundary]] · [[FxQueryBoundary]]
- [[QueryProvider]] · [[OnlineStatusProvider]] · [[ToastProvider]]
- [[ProtectedRoute]] · [[FeatureGate]] · [[FeatureRoute]]
- [[LocationContext]]

## Testes

> [!info] Documentação de testes de componentes — specs de renderização e hooks.

- [[FxPriceTag.test]] · [[FxDeliveryBadge.test]] · [[useRestaurants.test]]

## Veja Também

- [[MOC — Perfis do Sistema]] — Páginas que usam estes componentes
- [[Component Index]] — Índice completo de 110 componentes
