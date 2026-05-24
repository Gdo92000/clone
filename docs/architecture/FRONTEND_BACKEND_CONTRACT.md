---
title: Frontend-Backend Contract
aliases:
- Contrato
- Contrato Frontend Backend
- Integration Contract
- DTO Contract
- F/B Contract
section: raw-sources
tags:
- domain/api
---

# Contrato de integracao frontend/backend

Este front esta organizado para trocar dados mockados por API real sem mudar a estrutura das telas.

## Perfis

- Superadmin: planos, addons, billing, assinaturas e feature flags globais.
- Cliente: compra, carrinho, checkout, pedidos, favoritos, cupons e suporte.
- Lojista: empresas, filiais, cardapio, pedidos e configuracoes.
- Admin: empresas, cidades atendidas, auditoria operacional e financeiro.
- Entregador: entregas disponiveis, status de rota e ganhos.

## Endpoints sugeridos

### Cliente

- `GET /restaurants?city=Franca&state=SP`
- `GET /restaurants/:id`
- `GET /restaurants/:id/menu`
- `POST /orders`
- `GET /orders/me`
- `GET /orders/:id/tracking`
- `GET /coupons`
- `GET /favorites`
- `POST /favorites`
- `POST /support/tickets`

### Lojista

- `GET /merchant/features`
- `GET /merchant/workspace`
- `GET /merchant/companies`
- `POST /merchant/companies`
- `GET /merchant/branches`
- `POST /merchant/branches`
- `PATCH /merchant/branches/:id`
- `GET /merchant/menu-items`
- `POST /merchant/menu-items`
- `PATCH /merchant/menu-items/:id`
- `GET /merchant/orders`
- `PATCH /merchant/orders/:id/status`
- `GET /merchant/settings/:branchId`
- `PUT /merchant/settings/:branchId`

### Admin

- `GET /admin/metrics`
- `GET /admin/companies`
- `PATCH /admin/companies/:id/status`
- `GET /admin/coverage-cities`
- `GET /admin/finance`
- `GET /admin/reviews`
- `GET /admin/support/tickets`

### Superadmin SaaS

- `GET /superadmin/saas/metrics`
- `GET /superadmin/plans`
- `POST /superadmin/plans`
- `PATCH /superadmin/plans/:id`
- `GET /superadmin/addons`
- `POST /superadmin/addons`
- `PATCH /superadmin/addons/:id`
- `GET /superadmin/subscriptions`
- `PATCH /superadmin/subscriptions/:companyId`
- `POST /superadmin/subscriptions/:companyId/addons/:addonId`
- `DELETE /superadmin/subscriptions/:companyId/addons/:addonId`
- `GET /superadmin/feature-flags`
- `POST /superadmin/feature-flags`
- `PATCH /superadmin/feature-flags/:id`
- `GET /superadmin/billing/invoices`
- `POST /superadmin/billing/:companyId/block`
- `POST /superadmin/billing/:companyId/unblock`

### Entregador

- `GET /courier/deliveries`
- `PATCH /courier/deliveries/:id/status`
- `GET /courier/earnings`

## Regras de cidade

- A home deve mostrar restaurantes apenas da cidade detectada pelo GPS.
- Cidade atendida existe quando ha pelo menos uma filial cadastrada naquela cidade.
- Se nao houver filial/restaurante cadastrado, mostrar estado vazio com o nome da cidade.

## Status de pedido

- `new`
- `accepted`
- `preparing`
- `ready`
- `dispatched`
- `delivered`
- `rejected`

## Status de entrega

- `available`
- `accepted`
- `picked_up`
- `in_route`
- `delivered`

## Troca dos mocks

- `src/services/fakeApi.ts` concentra o padrao de chamada fake.
- `src/services/localStore.ts` concentra persistencia temporaria.
- Modulos por area ficam em `src/modules`.
- Ao criar backend, substituir chamadas fake por HTTP mantendo os mesmos tipos de tela.

## Monetizacao SaaS

- Plano base e addons sao entidades separadas.
- Uma empresa pode estar no plano Basic e comprar o addon Analytics Pro sem migrar para Pro.
- Recursos sao resolvidos por esta ordem: billing, feature flag manual, plano, addon.
- Status `past_due`, `blocked` e `cancelled` bloqueiam recursos pagos.
- Feature flags podem ser aplicadas por empresa ou por filial.
- Limites por plano ficam em `limits`: filiais, produtos, usuarios e campanhas.
- O Superadmin controla upgrade, downgrade, trial, bloqueio e addons.

## Capabilities monetizaveis

O SaaS usa um catalogo central em `src/modules/saas/capabilityCatalog.ts`.

Cada capability possui:

- `featureKey`
- nome e descricao
- preco mensal
- dependencias
- categoria
- plano minimo
- tipo de cobranca
- limites relacionados

Categorias usadas:

- core
- premium
- addon
- enterprise
- financial
- automation
- analytics
- integration
- operations

Capabilities atuais:

- Delivery proprio
- Multiplos usuarios
- Campanhas
- Analytics Pro
- Financeiro completo
- Relatorios avancados
- CRM de clientes
- Automacao WhatsApp
- IA para descricoes
- API access
- White label
- Tela de cozinha

O valor dos addons e somado a assinatura via `calculateSubscriptionTotal`.
Dependencias sao exibidas no Superadmin em `/superadmin/capabilities`.

## Modulos premium do lojista

- `/merchant/team`: equipe, convites, papeis e vinculo por filial. Requer `multi_users` e permissao `users.manage`.
- `/merchant/finance`: financeiro completo, fluxo de caixa, despesas, repasses, conciliacao e exportacao mockada. Requer `financial_suite` e permissao `finance.view`.
- `/merchant/campaigns`: campanhas comerciais. Requer `campaigns`.
- `/merchant/analytics`: analytics operacional. Requer `analytics`.

## RBAC enterprise

Papeis mockados:

- `superadmin`: gerencia planos, addons, billing, feature flags, usuarios, auditoria e bloqueios.
- `admin`: opera empresas, cidades, pedidos e entregas.
- `company_owner`: gerencia billing da empresa, usuarios, pedidos, campanhas e analytics.
- `branch_manager`: gerencia operacao da filial, pedidos, campanhas e analytics.
- `attendant`: gerencia pedidos.
- `finance`: acessa billing e analytics.
- `courier`: gerencia entregas.
- `customer`: usa checkout, pedidos, cupons e suporte.

Permissoes principais:

- `plans.manage`
- `billing.manage`
- `companies.block`
- `features.manage`
- `campaigns.create`
- `analytics.view`
- `users.invite`
- `users.manage`
- `orders.manage`
- `deliveries.manage`
- `checkout.use`

## Limites por plano

- `branches`: quantidade maxima de filiais.
- `products`: quantidade maxima de produtos.
- `users`: quantidade maxima de usuarios.
- `campaigns`: quantidade maxima de campanhas ativas.
- `coupons`: previsto para backend como limite comercial.
- `reports`: previsto para backend como limite de relatorios.

Quando o limite e excedido, o front bloqueia a acao, mostra feedback visual e sugere upgrade.

## Feature flags avancadas

Escopos aceitos:

- Global: afeta toda a plataforma.
- Empresa: afeta todas as filiais da empresa.
- Filial: afeta uma filial especifica.
- Usuario: preparado no modelo para liberar/bloquear por usuario.

Ordem de resolucao atual:

1. Billing/status comercial.
2. Feature flag global.
3. Feature flag por empresa/filial.
4. Plano.
5. Addon.

## Ecossistema demo

O ambiente sem backend contem dados relacionais para demonstracao:

- empresas;
- filiais;
- usuarios;
- clientes;
- categorias;
- restaurantes;
- cardapios;
- produtos com fotos;
- opcionais e variacoes;
- planos;
- addons;
- assinaturas;
- faturas;
- auditoria;
- notificacoes;
- cupons;
- campanhas.

Assets remotos usam `loading="lazy"` nas telas novas e possuem fallback estrutural por texto/contexto.

---

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[MOC — Perfis do Sistema]] · [[API]]
