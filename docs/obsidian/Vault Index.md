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
updated_at: 2026-06-12
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
| [[Frontend — Estrutura e Padrões]] | Estrutura e padrões do frontend React (incl. SEO, web-vitals) |
| [[Estrutura do Backend]] | Organização do backend Hono (incl. 4 novos serviços) |
| [[Visão Geral do Projeto]] | Visão geral do produto Flux Delivery |
| [[Arquitetura de Camadas]] | Camadas L1-L6 e regras de import |
| [[Repository Ports & Schemas]] | Contratos de repositório e schemas |
| [[Packages Locais]] | Pacotes tokens/ e ui/ |
| [[MSW — Mock Service Worker]] | Configuração de mocks de API |
| [[Módulos Core do Backend]] | Módulos centrais do backend |
| [[Arquitetura de Dados]] | Data architecture Postgres/Memory |
| [[Testes — Estrutura e Padrões]] | Padrões de teste do projeto |
| [[Rotas da API]] | Referência de rotas da API (atualizada LOOP 4) |
| [[Decisões Arquiteturais]] | Decisões arquiteturais (14 itens, ADR-006/008) |
| [[Error Handling e Performance]] | Error hierarchy, chunk splitting, web vitals |
| [[Learnings Fases 41-43]] | Fluxo delivery/pickup, Analytics/Financeiro, remoção Enterprise |
| [[Mirror Service — Arquitetura e Auditoria]] | Schema dual, mapeamento, problemas conhecidos |
| [[Dev vs Production - Comportamentos Diferenciados]] | NUMERIC coercion, UF normalization, MSW scope |

## worklog/

Notas temporárias — tarefas, sessões, checkpoints, bugs.

| Nota | Descrição |
|------|-----------|
| [[Worklog Index]] | Índice do diretório worklog |
| [[2026-06-10-loop1-typescript-backend-cleanup]] | LOOP 1 — 112 TS errors → 0 |
| [[2026-06-10-loop2-ci-cd-pipeline]] | LOOP 2 — Pipeline CI/CD |
| [[2026-06-11-loop3-backend-tests]] | LOOP 3 — 87 files, 650 testes |
| [[2026-06-12-loop4-auditoria-arquitural]] | LOOP 4 — Service extraction + ADRs |
| [[2026-06-12-loop5-otimizacao-build-seo]] | LOOP 5 — SEO, chunk split, web vitals |
| [[2026-05-23-auditoria-production-ready]] | Auditoria production-ready (53 findings) |
| [[2026-05-23-fase5-performance]] | Fase 5 — Performance (leaflet code-split, chunks) |
| [[Estado do Projeto — Fases]] | Status geral das fases (1-23) |
| [[Proximidade e Geocodificação]] | Feature de proximidade |
| [[Proximity Feature — Correções e Testes]] | Correções e testes da proximidade |
| [[Fase 18 — Snapshot Fixtures]] | Fase de snapshot fixtures |
| [[Fase 27 - Governanca de Geocoding - Fase 0]] | Governança de geocoding |
| [[Fase 28 - Remocao de mockCoverageCities]] | Cobertura geofencing-ready |
| [[Fase 29 - Coordenadas Reais e Geocodificacao]] | Coordenadas reais + Google Maps |
| [[Fase 30 - Mock Cleanup]] | Eliminação de mocks mortos |
| [[Fase 30 - Part 3 - Correcao 3 Problemas Runtime]] | 3 bugs runtime corrigidos |
| [[MOBILE_FIRST_AUDIT_2026-06-06]] | Auditoria Mobile First |
| [[final-audit-merchant-module]] | Auditoria final do módulo Merchant |

## adr/

Decisões arquiteturais permanentes.

| Nota | Descrição | Status |
|------|-----------|--------|
| [[ADR Index]] | Índice do diretório adr | — |
| [[ADR-001 ViaCEP como fonte oficial de bairro]] | ViaCEP como fonte oficial de bairro | ✅ |
| [[ADR-002 Proveniancia e Confidence de Coordenadas]] | Proveniência e Confidence de Coordenadas | ✅ |
| [[ADR-003 Cobertura Geofencing-Ready]] | Cobertura derivada de restaurantes ativos | ✅ |
| [[ADR-004 DB Seed como Single Source of Truth]] | DB Seed como fonte única de dev | ✅ |
| [[ADR-005 Mirror Service Atomicidade e Integridade]] | Migrar mirrorService para `db.transaction` | ⏳ |
| [[ADR-006 PostgreSQL Concrete vs Generic Schema]] | Tipos concretos > genéricos no schema DB | ✅ |
| [[ADR-007 Test Pattern]] | Padrões de teste (mockedDb, middlewares, fixtures) | ✅ |
| [[ADR-008 Repository Pattern para novos módulos]] | Repository Pattern obrigatório p/ novos módulos | ✅ |

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
