---
type: classifier
status: active
domain: memory
layer: L1
immutable: false
zone: OPERATIONAL
semantic_priority: 5
tags:
  - task/classifier
  - capability/routing
created_at: 2026-05-28
updated_at: 2026-05-28
---

# TASK CLASSIFIER — Capability Mapping

## Capabilities & Keywords

- **frontend**: componente, React, UI, tela, interface, botão, formulário, CSS, Tailwind
- **backend**: API, server, endpoint, controller, serviço, rota, middleware, banco
- **infra**: deploy, produção, CI, CD, Docker, Vercel, Netlify, servidor
- **testing**: teste, test, spec, coverage, Jest, Vitest, Playwright, E2E
- **audit**: review, revisar, código, qualidade, segurança, vulnerabilidade
- **architecture**: arquitetura, estrutura, ADR, decisão, trade-off, padrão
- **security**: segurança, vulnerabilidade, SQL injection, XSS, CSRF, auth
- **refactor**: refatorar, reestruturar, limpar, simplificar, modularizar
- **debugging**: debug, bug, erro, crash, falha, diagnóstico, log
- **planning**: planejar, planejamento, roadmap, milestone, cronograma
- **documentation**: documentação, README, guia, tutorial, comentário
- **game-development**: jogo, game, sprite, física, tilemap, câmera
- **mobile**: mobile, iOS, Android, React Native, Flutter, app
- **performance**: performance, velocidade, otimizar, lento, FPS, bundle
- **seo**: SEO, Google, Core Web Vitals, LCP, CLS, meta tags

## Multi-Capability Detection

If multiple keywords detected, gather all matching capabilities. The primary is the first match.

## Output

Return object:
```json
{
  "task": "user prompt summary",
  "capabilities": ["frontend","testing"],
  "primary": "frontend"
}
```

Then load: `.opencode/capabilities/<primary>.manifest.json`

## Unmatched Task Handling

If no capability matches, ask the user to clarify the task scope. Do not fall back to an unscoped profile — every task must have a capability manifest to gate retrieval.
