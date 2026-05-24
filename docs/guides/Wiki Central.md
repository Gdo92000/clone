---
title: Wiki Central
aliases:
- Wiki
- Indice
- Indice Wiki
- Docs Index
- _index
- Index
tags:
- type/index
---

# Flux Delivery — Wiki Central

Mapa de toda a documentação do projeto, organizado em **duas camadas**:

| Camada | Diretório | Descrição |
|--------|-----------|-----------|
| **Wiki** | `docs/` | Docs organizadas, interligadas, sempre atualizadas pelo time |
| **Raw Sources** | `docs/sources/` | Fontes brutas — specs, auditorias, contratos. Não são editadas rotineiramente. |

> O **Schema** (AGENTS.md) está na raiz do repo e descreve as regras, convenções e workflows.

---

## Wiki

### Arquitetura

| Arquivo | Conteúdo |
|---------|----------|
| [[ARCHITECTURE]] | Diagramas, camadas (frontend/backend/DB), middlewares, auth flow |
| [[DATABASE]] | Schema Drizzle, 45 tabelas, índices geo-espaciais, migrations |
| [[FRONTEND_BACKEND_CONTRACT]] | Contrato de integração — perfis, endpoints sugeridos, contratos de DTO |

### Guias do desenvolvedor

| Arquivo | Conteúdo |
|---------|----------|
| [[Guides Index]] | Índice de guias do desenvolvedor |
| [[DEVELOPMENT]] | Scripts, workflow, TypeScript quirks, ESLint, adicionar rotas/features |
| [[TESTING]] | Vitest dual-project, MSW, padrões de teste, cenários |
| [[CONFIGURATION]] | `.env`, TypeScript, Vite, Drizzle, Tailwind, ESLint, Git |

### API

| Arquivo | Conteúdo |
|---------|----------|
| [[API]] | Referência completa de endpoints (35+ rotas), health, metrics |

### Componentes

| Arquivo | Conteúdo |
|---------|----------|
| [[Component Index]] | Mapa completo de 110 componentes/wikilinks |

### Memória Operacional (Obsidian Vault)

| Arquivo           | Conteúdo                               |                                        |
| ----------------- | -------------------------------------- | -------------------------------------- |
| [[Vault Index]] | Índice completo do vault de memória |
| [[CURRENT_STATE]] | Estado atual — fase, commit, bloqueios |                                        |
| [[MEMORY\|Obsidian MEMORY]]                      | Memória enxuta — progresso consolidado |

### MOCs (Maps of Content)

| Arquivo | Conteúdo |
|---------|----------|
| [[MOC — Arquitetura do Sistema]] | Documentação arquitetural completa |
| [[MOC — Perfis do Sistema]] | Páginas e componentes por perfil |
| [[MOC — UI Primitives]] | Componentes React reutilizáveis |
| [[MOC — Guias de Desenvolvimento]] | Guias operacionais de desenvolvimento |
| [[MOC — Histórico do Projeto]] | Evolução, fases, worklogs e auditorias |
| [[MOC Index]] | Índice central de todos os MOCs (16 hubs semânticos) |
| [[System Index]] | Sistema de inteligência semântica — SIS |

### Outros

| Arquivo | Conteúdo |
|---------|----------|
| [[Component Index|README]] | Índice de componentes (110 componentes documentados) |
| [AGENTS.md](AGENTS.md) | Regras arquiteturais, convenções, critérios de conclusão |

---

## Raw Sources

Fontes brutas — especificações, auditorias, contratos. São imutáveis por padrão.

| Arquivo | Origem |
|---------|--------|
| [[Sources Index]] | Índice de fontes brutas |
| [[clone]] | Especificação original do produto (iFood clone) |
| [[contexto]] | Contexto de requisitos para feature de proximidade |
| [[PRINTING_ARCHITECTURE]] | Arquitetura do addon de impressão térmica |
| [[PRODUCTION-READINESS]] | Relatório de auditoria de produção |
| [[kitchen-auto-print-addon]] | Guia do usuário — addon cozinha |

---

_Índice gerado automaticamente — 20+ entries._
