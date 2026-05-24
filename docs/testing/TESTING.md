---
title: Testing Guide
aliases:
- Testes
- Testes Guide
- Guia de Testes
- Vitest Guide
- Test Strategy
section: guides
tags:
- domain/testing
---

# Flux Delivery — Testing Guide

> [!abstract] Hub de Testes
> Referência completa de testes. Seções detalhadas estão em notas especializadas — siga os wikilinks.

## Seções Especializadas

| Nota | Conteúdo |
|------|----------|
| [[Testes — Configuração e Padrões]] | Vitest dual-project, mock placement, async patterns, QueryClient config, coverage, file organization, build exclusions |
| [[Testes — Frontend Components e Hooks]] | Component tests, hook tests (React Query), repository tests, mocking child dependencies |
| [[Testes — Backend Routes e Funções]] | Route integration tests (Hono + `app.request()`), pure function tests, DB mock chains |
| [[Testes — MSW Handlers e Cenários]] | MSW setup, handler tests, scenarios (empty_store, kitchen_congested, payment_declined, etc.) |

---

## Resumo da Arquitetura de Testes

![[Testes — Configuração e Padrões#Dual Project Config (`vitest.config.ts`)]]

## Quick Reference

```bash
npm test                # vitest interactive (watch mode)
npm run test:run        # vitest single-pass
npm run test:coverage   # vitest run --coverage (v8 provider)
```

---

> [!tip] Navegação
> [[MOC — Guias de Desenvolvimento]] · [[Testes — Estrutura e Padrões]] · [[MSW — Mock Service Worker]]
