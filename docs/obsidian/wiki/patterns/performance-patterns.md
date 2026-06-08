---
type: pattern
status: active
domain: engineering
layer: L3
created_at: 2026-06-02
updated_at: 2026-06-02
tags:
  - performance
  - optimization
  - bundle
---

# Performance Patterns

## Quando aplicar

- Componente renderizando lento (>16ms por frame)
- Bundle JS crescendo sem controle
- API server com latencia p95 > 200ms
- Memoria crescendo sem liberacao (leak)

## Decisoes canonicas

- **Medir antes de otimizar**: usar React DevTools Profiler, `console.time`, ou `performance.now()`. Sem baseline = chute.
- **Memo apenas em listas >50 items**: `useMemo`/`useCallback` tem custo. Aplicar so onde a economia e comprovada.
- **Lazy load de rotas**: `React.lazy()` em todas as rotas de `src/pages/`. Bundle inicial = apenas `/` + `/login`.
- **Server-side pagination obrigatorio**: nenhum endpoint retorna mais que 100 items. Cursor-based, nao offset.
- **Bundle analyzer no CI**: `npm run build -- --analyze` falha se chunk principal > 250KB gzip.

## Anti-padroes

- `useMemo` em computacao trivial (<1ms) = overhead > beneficio
- Fetch all + filter client-side (deve ser server-side)
- Imagem sem `loading="lazy"` + `width`/`height` (CLS + reflow)
- `useEffect` que faz trabalho sincrono caro (bloqueia paint)
- Re-render de lista inteira quando 1 item muda (key prop faltando ou sendo index)

## Onde aprofundar

- `docs/obsidian/project-operating-system/02-ARCHITECTURE/SEMANTIC_OBSERVABILITY.md`
- `docs/obsidian/wiki/patterns/frontend-patterns.md` (memoization)
- `docs/obsidian/wiki/patterns/testing-patterns.md` (perf tests)
