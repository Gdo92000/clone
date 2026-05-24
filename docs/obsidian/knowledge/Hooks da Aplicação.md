---
title: Hooks da Aplicação
aliases:
- React Hooks
- Custom Hooks
- Hooks
tags:
- type/knowledge
- domain/hooks
created_at: 2026-05-24
updated_at: 2026-05-24
---

# Hooks da Aplicação

Hooks customizados do React utilizados no Flux Delivery, majoritariamente construídos sobre TanStack React Query para data-fetching.

## Hooks de Consulta (React Query)

### Perfil Merchant

| Hook | Descrição |
|------|-----------|
| `useMerchantData` | Dados do perfil merchant logado |
| `useMerchantSettings` | Configurações do merchant |
| `useMerchantLoyaltyRewards` | Programa de fidelidade do merchant |
| `useMerchantKitchenAutoPrint` | Configuração de impressão automática |
| `useMerchantCoupons` | Cupons do merchant |
| `useMerchantCampaigns` | Campanhas promocionais |
| `useMerchantPrinterConfig` | Configuração de impressoras |

### Perfil Admin / Superadmin

| Hook | Descrição |
|------|-----------|
| `useSuperadminData` | Dados do superadmin logado |
| `useAdminData` | Dados do admin logado |
| `useCoverageData` | Dados de cobertura |
| `useCoverageCities` | Cidades com cobertura |

### Perfil Consumer

| Hook | Descrição |
|------|-----------|
| `useConsumerData` | Dados do consumidor logado |
| `useCart` | Estado do carrinho de compras |
| `useRestaurants` | Listagem de restaurantes |
| `useRestaurantFilter` | Filtros de busca de restaurantes |
| `useNearbyRestaurants` | Restaurantes próximos |
| `useAddressSearch` | Busca de endereços |

### Perfil Courier

| Hook | Descrição |
|------|-----------|
| `useCourierData` | Dados do entregador logado |
| `useOrderTracking` | Rastreamento de pedidos |

### Infraestrutura

| Hook | Descrição |
|------|-----------|
| `useOperations` | Operações genéricas (merchant hours, holidays) |
| `usePersistentState` | Estado persistente (localStorage/sessionStorage) |
| `useFeatureAccess` | Verificação de acesso a features |
| `useNetworkStatus` | Status de conectividade |
| `useLogin` | Fluxo de autenticação |
| `useThemeData` | Configuração de tema |
| `useAuthSession` | Sessão de autenticação |
| `useSSE` | Server-Sent Events |

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[MOC — UI Primitives]]
