---
type: pattern
status: active
domain: engineering
layer: L3
created_at: 2026-06-02
updated_at: 2026-06-02
tags:
  - error-handling
  - try-catch
  - propagation
---

# Error Handling Patterns

## Quando aplicar

- Adicionar chamada async (HTTP, DB, I/O)
- Decidir se erro e user-facing ou so log
- Implementar retry, fallback ou circuit breaker

## Decisoes canonicas

- **Erro explicito, nunca swallowed**: `try/catch` exige handler que faz algo (log, transform, rethrow). Catch vazio = bug latente.
- **Estrutura Error tipada**: classes de erro por dominio (`AuthError`, `ValidationError`, `NetworkError`). Discriminator `code` permite switch.
- **Boundaries explicitas**: errors sao traduzidos UMA vez na boundary (HTTP route -> HTTP status, CLI -> exit code). Apos boundary, fluem como Error cru.
- **Logging estruturado**: `{ level, code, message, context: {...} }`. Nunca concatenar string com dados sensiveis.
- **User-facing vs log-only**: 4xx = mensagem util ao usuario. 5xx = log detalhado, mensagem generica ao usuario.

## Anti-padroes

- `try { ... } catch (e) {}` (catch silencioso)
- Stack trace completo exposto em response 500 (vaza internals; permite fingerprinting)
- `throw "string"` em vez de `throw new Error(...)` (perde stack)
- `Promise.all` sem `Promise.allSettled` quando falhas parciais sao aceitaveis

## Onde aprofundar

- `docs/obsidian/project-operating-system/03-ENGINEERING/CODE_STANDARDS.md` (regra "explicit error handling")
- `docs/obsidian/project-operating-system/08-SECURITY/SECURITY_RUNTIME.md` (compliance: sem dados sensiveis em logs)
- `docs/obsidian/wiki/patterns/debugging-patterns.md`
