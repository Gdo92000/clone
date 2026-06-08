---
type: guide
status: draft
domain: agents
layer: L1
semantic_priority: 5
tags:
  - type/guide
  - domain/agents
  - tech/discovery
aliases:
  - Capability Discovery
  - Descoberta de Capacidades
created_at: 2026-05-26
updated_at: 2026-05-26
---

# CAPABILITY DISCOVERY

Mecanismo de descoberta dinâmica de capacidades do ambiente, stack, módulos ativos e constraints do projeto.

---

## Stack Discovery

| Dimensão | Fonte | Exemplo |
|----------|-------|---------|
| Frontend | package.json, tsconfig | React 19, Vite 8, Tailwind 4 |
| Backend | package.json | Hono 4, Drizzle 0.45 |
| Database | drizzle.config | PostgreSQL (Supabase) |
| Auth | server code | JWT HS256, bcryptjs |
| Testing | vitest.config | Vitest, MSW 2 |
| CI/CD | CI config | GitHub Actions |

---

## Framework Discovery

| Framework | Versão | Uso |
|-----------|--------|-----|
| React | 19 | Frontend |
| Hono | 4 | Backend API |
| Drizzle ORM | 0.45 | Database access |
| TanStack Query | 5 | Data fetching |
| React Router | 7 | Routing |
| Tailwind CSS | 4 | Styling |
| Zod | 4 | Validation |

---

## Provider Discovery

| Provider | Tipo | Documentação |
|----------|------|-------------|
| Supabase | Database + Auth | [[07-INFRA/_index]] |
| Photon | Geocoding | Vite proxy config |
| Nominatim | Geocoding | Vite proxy config |

---

## Domain Pack Discovery

| Pack | Status | Description |
|------|--------|-------------|
| saas-core | active | Universal SaaS building blocks |
| ai-saas | beta | AI‑native SaaS extensions |
| marketplace | beta | Marketplace platform components |
| admin-dashboard | alpha | Admin UI and governance |
| multi-tenant | alpha | Multi‑tenant isolation and lifecycle |
| realtime-platform | alpha | Real‑time sync and streaming |
| ecommerce | alpha | E‑commerce checkout and order flow |
| internal-tools | alpha | Internal tooling and automation |

---

## Active Modules Discovery

| Módulo | Status | Localização |
|--------|--------|-------------|
| Auth | active | src/modules/auth/ |
| Merchant | active | src/modules/merchant/ |
| Admin | active | src/modules/admin/ |
| SaaS | active | src/modules/saas/ |
| SuperAdmin | active | src/modules/superadmin/ |
| Courier | active | src/modules/courier/ |
| Enterprise | planned | src/modules/enterprise/ |
| Experience | planned | src/modules/experience/ |

---

## Environment Constraints

| Ambiente | Variáveis | Impacto |
|----------|-----------|---------|
| Development | `.env` local | Full debug, hot reload |
| Staging | CI env vars | Limited data |
| Production | Secrets manager | No debug, full security |

---

## Enabled Capabilities

| Capacidade | Fonte | Status |
|------------|-------|--------|
| Route code-splitting | App.tsx | enabled |
| Lazy loading | React.lazy | enabled |
| MSW mock | vitest.config | enabled |
| ESLint strict | eslint.config.js | enabled |
| TypeScript strict | tsconfig | enabled |
| Drizzle migrations | drizzle.config | enabled |
| Hono zod-validator | server routes | enabled |

---

## Feature Flags

| Flag | Descrição | Default |
|------|-----------|---------|
| __USE_MOCK__ | Use MSW mock data | false |
| DEBUG_MODE | Enable debug logs | false (dev only) |

---

## Semantic Graph Discovery

O agente descobre capacidades semânticas navegando:

1. [[02-ARCHITECTURE/_index]] → architecture docs + ADRs
2. [[03-ENGINEERING/_index]] → engineering standards
3. [[04-AGENTS/_index]] → agent skills + protocols
4. [[SKILL_REGISTRY]] → catálogo de skills
5. [[99-TEMPLATES/reusable/_index]] → templates reutilizáveis

---

## Relações

- [[_index|04-AGENTS Index]]
- [[SKILL_REGISTRY]] — Skills disponíveis
- [[AGENT_PROTOCOL]] — Protocolo de execução
