---
title: Fase 5 — Performance
type: worklog
status: concluded
created_at: 2026-05-23
updated_at: 2026-05-23
related:
- MEMORY.md
- CURRENT_STATE.md
- vite.config.ts
 - src/components/address/AddressMap.tsx
tags:
 - type/worklog
---

# Fase 5 — Performance

## Objetivo

Otimizar bundle e performance de carregamento: code-split de libs pesadas, análise de CSS, chunk consolidation, bundle visualizer.

## O que foi feito

1. **Leaflet code-split** — `AddressMap.tsx`: static `import L from 'leaflet'` substituído por `Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])` com loading state (opacity 0.5→1), error state ("Mapa indisponivel"), `cancelled` flag no cleanup, refs `latRef`/`lngRef` para evitar stale closure
2. **Vendor chunk splitting** — `vite.config.ts`: `manualChunks` expandido de 3 para 5 chunks: `vendor-leaflet`, `vendor-tanstack`, `vendor-router` (além de `vendor-react`, `vendor-icons`, `vendor-other`)
3. **Bundle visualizer** — `rollup-plugin-visualizer` instalado + configurado; gera `dist/stats.html` a cada build
4. **Tailwind v4 CSS** — análise confirmou tree-shaking automático: 651 regras, 190KB raw / 28KB gzip (normal para app com dark mode + design tokens)
5. **Small chunks** — sub-1KB chunks são lazy route chunks; consolidar pioraria caching individual

## Resultado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Leaflet no bundle | 148KB em vendor-other | 148KB chunk separado (lazy-loaded) |
| vendor-other | 253KB | 68KB |
| Vendor chunks | 3 | 5 |
| Bundle visualizer | ❌ | ✅ dist/stats.html |
| CSS purge | ❌ análise pendente | ✅ Tailwind v4 auto-purge confirmado |
| Lint | ✅ | ✅ 0 erros |
| TypeScript | ✅ | ✅ compila |
| Testes | 242 passed | 242 passed |
| Build | ✅ | ✅ limpo |

## Decisões

- **Sub-1KB chunks não consolidados**: lazy route chunks individuais melhoram caching HTTP; consolidar forçaria re-download de código não-alterado
- **Tailwind CSS sem ação**: v4 faz content detection automático; 190KB/28KB gzip é normal para a complexidade do app
- **Error state como terminal**: se leaflet falha ao carregar, o usuário vê "Mapa indisponivel" e precisa navegar fora/volta para retry — preferido a lógica de retry complexa

## Code review fixes

- Stale closure corrigido com `latRef`/`lngRef` (refs atualizados em useEffect dedicado, conforme `react-hooks/refs`)
- Unused `eslint-disable` directive removida

> [!tip] Navegação
> [[MEMORY|Obsidian MEMORY]] · [[CURRENT_STATE]] · [[MOC — Histórico do Projeto]]
