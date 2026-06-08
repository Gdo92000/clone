---
type: pattern
status: active
domain: security
layer: L3
created_at: 2026-06-02
updated_at: 2026-06-02
tags:
  - security
  - auth
  - validation
---

# Security Patterns

## Quando aplicar

- Adicionar endpoint HTTP novo
- Receber input externo (user, API third-party, file upload)
- Persistir dado sensivel (senha, token, PII)
- Integrar com servico externo (OAuth provider, payment)

## Decisoes canonicas

- **Input validation em boundary**: Zod schema no primeiro ponto de entrada (route handler, action). Confianca zero ate validar.
- **Auth em TODA rota nao-publica**: middleware `requireAuth` aplicado em router-level, nao em cada handler. Whitelist explicita para rotas publicas.
- **Secrets em env vars**: nunca em codigo, comentarios, logs, ou .env versionado. `.env*` no `.gitignore`. Rotacao imediata se exposto.
- **CSP e CORS restritivos**: `default-src 'self'`. CORS allowlist explicita por origin (sem `*` em prod).
- **Output encoding em boundary HTML**: `dangerouslySetInnerHTML` proibido sem sanitizacao previa (DOMPurify).

## Anti-padroes

- `eval`, `Function()`, ou `new Function(code)` em qualquer path
- `innerHTML` assignment direto (XSS vector)
- Comparacao de senha com `==` em vez de `timingSafeEqual`
- Log de token/senha/cookie (vaza em log aggregation)
- Disable de CSRF protection "temporariamente" sem ticket de follow-up

## Onde aprofundar

- `docs/obsidian/project-operating-system/08-SECURITY/SECURITY_RUNTIME.md` (regras executaveis)
- `docs/obsidian/project-operating-system/08-SECURITY/SECURITY_GUIDE.md`
- `docs/obsidian/wiki/patterns/error-handling-patterns.md` (nao vazar internals em 5xx)
