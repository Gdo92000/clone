---
title: LOOP 5 — Otimização Build/SEO
type: worklog
status: concluded
created_at: 2026-06-12
updated_at: 2026-06-12
related:
  - MEMORY.md
  - CURRENT_STATE.md
  - index.html
  - src/components/SEO.tsx
  - src/components/WebVitalsReporter.tsx
  - vite.config.ts
  - public/robots.txt
  - public/sitemap.xml
tags:
  - type/worklog
  - loop/5
---

# LOOP 5 — Otimização Build/SEO

## Escopo

Melhorar meta tags SEO, structured data, chunk splitting do build, Core Web Vitals monitoring.

## O que foi feito

### SEO
- `<title>`: "iFood Clone" → "Flux Delivery"
- Meta description, Open Graph (og:title, description, image, type, locale), Twitter Cards
- Canonical URL (`https://fluxdelivery.app`)
- `robots.txt` — permite crawlers, aponta sitemap
- `sitemap.xml` — 6 URLs (/, /restaurants, /nearby, /cart, /login, /search)
- **JSON-LD** — Organization schema via componente SEO
- **`react-helmet-async`** — SEO component + SEOProvider para meta por página
- Google Fonts: removido `@import` duplicado do CSS, mantido `<link>` no HTML com preconnect

### Build (Chunk Splitting)
- **vendor-other**: 869 KB → **418 KB** (-51%)
- **vendor-charts** (recharts, 432 KB) extraído de vendor-other
- **vendor-ui** (sonner, clsx, tailwind-variants, 65 KB) extraído de vendor-other

### Core Web Vitals
- `web-vitals` instalado
- `WebVitalsReporter` — monitora LCP, CLS, INP, TTFB

### Fixes
- `server/tsconfig.json` — `moduleResolution`: "bundler" → "node16" (TS6 compat)
- `auth/index.test.ts` — timeout 5s → 10s (flaky fix)

## Chunks finais

| Chunk | Tamanho |
|-------|:-------:|
| vendor-charts | 432 KB |
| vendor-react | 420 KB |
| vendor-other | 418 KB |
| vendor-leaflet | 148 KB |
| vendor-ui | 65 KB |
| vendor-tanstack | 37 KB |
| vendor-icons | 17 KB |
