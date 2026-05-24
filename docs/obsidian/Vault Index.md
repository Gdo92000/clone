---
title: Vault Index
aliases:
- Indice Vault
- Memoria Operacional Indice
- Obsidian Index
tags:
- type/index
- type/memory
created_at: 2026-05-23
updated_at: 2026-05-24
---

# Vault de Memória Operacional

## Sistema

| Arquivo | Descrição |
|---------|-----------|
| [[CURRENT_STATE]] | Estado operacional atual (fase, commit, bloqueios) |
| [[MEMORY|Obsidian MEMORY]] | Memória enxuta — progresso consolidado |

## mocs/ — MOCs Semânticos Canônicos

MOCs em `docs/obsidian/mocs/` — hubs semânticos por domínio para navegação contextual e RAG.

| MOC | Domínio |
|-----|---------|
| [[MOC _index]] | Índice estrutural do diretório mocs/ |
| [[MOC Index]] | Índice central |
| [[MOC Architecture]] | `domain/architecture` |
| [[MOC Frontend]] | `domain/frontend` |
| [[MOC Backend]] | `domain/backend` |
| [[MOC Auth]] | `domain/auth` |
| [[MOC Delivery Flow]] | `domain/delivery` |
| [[MOC Database]] | `domain/database` |
| [[MOC Testing]] | `domain/testing` |
| [[MOC Addons]] | `domain/addons` |
| [[MOC SaaS]] | `domain/saas` |
| [[MOC Merchant]] | `domain/merchant` |
| [[MOC Courier]] | `domain/courier` |
| [[MOC Admin]] | `domain/admin` |
| [[MOC SuperAdmin]] | `domain/superadmin` |
| [[MOC RAG]] | `domain/rag` |
| [[MOC Obsidian System]] | `domain/obsidian` |

## knowledge/

Conhecimento permanente — arquitetura, padrões, integrações.

| Nota | Descrição |
|------|-----------|
| [[Knowledge Index]] | Índice do diretório knowledge |
| [[MOC — Arquitetura do Sistema]] | Ponto de entrada central para documentação arquitetural |
| [[MOC — Perfis do Sistema]] | Páginas e componentes por perfil de usuário |
| [[MOC — UI Primitives]] | Componentes React reutilizáveis por categoria |
| [[MOC — Guias de Desenvolvimento]] | Guias operacionais de desenvolvimento |
| [[MOC — Histórico do Projeto]] | Evolução, fases, worklogs e auditorias |
| [[Frontend — Estrutura e Padrões]] | Estrutura e padrões do frontend React |
| [[Estrutura do Backend]] | Organização do backend Hono |
| [[Visão Geral do Projeto]] | Visão geral do produto Flux Delivery |
| [[Arquitetura de Camadas]] | Camadas L1-L6 e regras de import |
| [[Repository Ports & Schemas]] | Contratos de repositório e schemas |
| [[Packages Locais]] | Pacotes tokens/ e ui/ |
| [[MSW — Mock Service Worker]] | Configuração de mocks de API |
| [[Módulos Core do Backend]] | Módulos centrais do backend |
| [[Arquitetura de Dados]] | Data architecture Postgres/Memory |
| [[Testes — Estrutura e Padrões]] | Padrões de teste do projeto |
| [[Rotas da API]] | Referência de rotas da API |

## worklog/

Notas temporárias — tarefas, sessões, checkpoints, bugs.

| Nota | Descrição |
|------|-----------|
| [[Worklog Index]] | Índice do diretório worklog |
| [[2026-05-23-auditoria-production-ready]] | Auditoria production-ready (53 findings, 6 domínios) |
| [[2026-05-23-fase5-performance]] | Fase 5 — Performance (leaflet code-split, vendor chunks, visualizer) |
| [[Estado do Projeto — Fases]] | Status geral das fases |
| [[Proximidade e Geocodificação]] | Feature de proximidade |
| [[Proximity Feature — Correções e Testes]] | Correções e testes da proximidade |
| [[Fase 18 — Snapshot Fixtures]] | Fase de snapshot fixtures |

## adr/

Decisões arquiteturais permanentes.

| Nota | Descrição |
|------|-----------|
| [[ADR Index]] | Índice do diretório adr |

## system/ — Semantic Intelligence System

Infraestrutura de memória semântica operacional para IA/RAG e continuidade contextual.

| Nota | Prioridade | Descrição |
|------|-----------|-----------|
| [[System Index]] | ⭐ 5 | Índice central do SIS |
| [[SEMANTIC_INDEX]] | ⭐ 5 | Hub central — mapa do grafo, authority notes, clusters |
| [[GRAPH_HEALTH]] | ⭐ 5 | Métricas de integridade do grafo semântico |
| [[RETRIEVAL_RULES]] | ⭐ 4 | Ranking de retrieval, scoring e chunking |
| [[VECTOR_SEARCH]] | ⭐ 4 | Embeddings, busca vetorial e pipeline semântico |
| [[MEMORY_LIFECYCLE]] | ⭐ 5 | Ciclo de vida da memória (temporary → permanent) |
| [[SEMANTIC_SCORING]] | ⭐ 3 | Fórmulas de score semântico e autoridade |
| [[ORPHAN_REPORT]] | ⭐ 4 | Detecção e reconexão de notas órfãs |
| [[KNOWLEDGE_DECAY]] | ⭐ 3 | Política de envelhecimento e arquivamento |
| [[AUTO_LINKING]] | ⭐ 3 | Heurísticas de linking automático semântico |

## archive/

Notas arquivadas — nunca deletar automaticamente.

| Nota | Descrição |
|------|-----------|
| [[Archive Index]] | Índice do diretório archive |
| [[Session Memory]] | Sessão anterior — substituída por MEMORY.md + CURRENT_STATE.md |
