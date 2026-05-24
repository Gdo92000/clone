---
title: MOC — Arquitetura do Sistema
aliases:
- Arquitetura MOC
- System Architecture Map
- Mapa de Arquitetura
tags:
- type/moc
- domain/architecture
created_at: 2026-05-23
updated_at: 2026-05-23
---

# MOC — Arquitetura do Sistema

> [!abstract] Mapa de conteúdo
> Ponto de entrada central para toda a documentação arquitetural do Flux Delivery.

## Visão Geral

- [[ARCHITECTURE]] — Diagramas, camadas, middlewares, auth flow
- [[Visão Geral do Projeto]] — Produto, perfis, tech stack

## Camadas e Estrutura

- [[Arquitetura de Camadas]] — L1-L6, regras de import, invariantes
- [[Frontend — Estrutura e Padrões]] — React, Vite, Tailwind, TanStack Query
- [[Estrutura do Backend]] — Hono, serviços, middlewares

## Dados e Persistência

- [[Arquitetura de Dados]] — PostgreSQL, schema, estratégias de cache
- [[DATABASE]] — Schema Drizzle, 45 tabelas, índices geo-espaciais, migrations
- [[Repository Ports & Schemas]] — RepositoryPort, contratos, Zod schemas

## Backend — Módulos e Rotas

- [[Módulos Core do Backend]] — Logger, Circuit Breaker, health checks
- [[Rotas da API]] — Referência completa de rotas
- [[API]] — Hub de endpoints com links para notas especializadas
- [[API — Health, Metrics e Auth]] — Health probes, metrics, auth endpoints
- [[API — Restaurants, Menu, Reviews e Coverage]] — Restaurants, categories, menu, reviews
- [[API — Merchant, Operations e Branches]] — Companies, branches, orders, operations, printing
- [[API — Commerce, Coupons e Loyalty]] — Coupons, campaigns, loyalty
- [[API — SaaS, Admin, Permissions e Consumer]] — Plans, subscriptions, admin, permissions

## Integração Frontend ↔ Backend

- [[FRONTEND_BACKEND_CONTRACT]] — Contrato de integração, DTOs, perfis
- [[MSW — Mock Service Worker]] — Configuração de mocks de API

## Cross-cutting Concerns

- [[Authentication Flow]] — JWT HS256, login/refresh/logout, auth providers
- [[Middlewares e Segurança]] — Middleware stack, roles/permissions, CSRF, CORS, rate limiting
- [[Error Handling e Performance]] — Error hierarchy, Prometheus, graceful shutdown, optimizations

## SaaS e Feature System

- [[SaaS Capability System]] — Feature resolution, plans, addons, feature flags

## Decisões Arquiteturais

- [[Decisões Arquiteturais]] — 10 decisões com links para notas especializadas

## Pacotes

- [[Packages Locais]] — @fluxds/tokens, @fluxds/ui

## Testes

- [[TESTING]] — Hub de testes com links para notas especializadas
- [[Testes — Configuração e Padrões]] — Vitest config, mock placement, coverage
- [[Testes — Frontend Components e Hooks]] — Component, hook, repository tests
- [[Testes — Backend Routes e Funções]] — Route integration, pure function tests
- [[Testes — MSW Handlers e Cenários]] — MSW setup, handler tests, scenarios

## Guias Relacionados

- [[MOC — Guias de Desenvolvimento]] — Setup, workflow, configuração
- [[Wiki Central]] — Mapa completo da documentação
- [[Knowledge Index]] — Índice de conhecimento permanente
