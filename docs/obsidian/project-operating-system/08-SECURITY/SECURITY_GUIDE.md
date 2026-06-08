---
type: guide
status: active
domain: security
aliases:
  - Security Guide
created_at: 2026-05-27
updated_at: 2026-05-27
---

# SECURITY GUIDE

Boas práticas de segurança para o time. Referência consolidada.

## API Security

- Autenticação em todas as rotas (exceto públicas explícitas)
- Rate limiting por IP/usuário
- Validação de entrada em todas as APIs (schema validation)
- CORS configurado por origem, não aberto
- Headers de segurança: CSP, HSTS, X-Frame-Options

## Auth

- Senhas: bcrypt/argon2, nunca MD5/SHA1
- JWT: HS256 mínimo, expiry curto, refresh tokens
- Session: httpOnly, secure, SameSite cookies
- MFA em ações sensíveis (admin, deleção)
- OAuth: state parameter, PKCE, validate redirect_uri

## Input Validation

- Validar tipo, tamanho, formato na camada de entrada
- Sanitizar output (XSS prevention)
- Não confiar em client-side validation
- SQL injection: parameterized queries sempre
- File upload: validar tipo, tamanho, antivírus

## Dependencies

- `npm audit` / `pip audit` em CI
- Dependências com CVE critical: atualizar imediatamente
- Lockfile obrigatório (package-lock.json, poetry.lock)
- Revisar dependências novas antes de adicionar

## Secure Coding

- Sem debug info em produção
- Error handling: mensagens genéricas pro usuário, logs detalhados internos
- Memory: bounds checking, format string safety
- Crypto: usar libs padrão (não implementar próprio)

## RAG / Agent Security

- Contexto limitado ao necessário
- Retrieval filtered por permissão
- Sources verificados antes de incluir
- Grounding obrigatório: nunca inventar fonte

## Observability

- Audit log: timestamp, actor, action, resource, result
- Alertas em comportamentos anômalos
- Logs centralizados e imutáveis
- Health check endpoints públicos e privados

## Checklist

- [ ] Secrets: nenhum exposto em código
- [ ] Auth: todas as rotas protegidas
- [ ] Input: validation layer implementada
- [ ] Output: sanitization ativa
- [ ] Dependencies: audit recente
- [ ] Headers de segurança configurados
- [ ] CORS configurado
- [ ] Rate limiting ativo
- [ ] Audit trail implementado
- [ ] Error handling seguro
- [ ] TLS configurado
- [ ] Sem credenciais default

## Threat Model

- Identificar ativos, ameaças, controles existentes
- Classificar riscos (impacto x probabilidade)
- Revisar a cada mudança arquitetural significativa
- Documentar em ADR quando mitigação é aceita

## Incident Response

1. **Detect**: monitoramento, alertas, logs anômalos
2. **Contain**: isolar sistema, revogar acesso
3. **Eradicate**: remover causa, patch, atualizar
4. **Recover**: restaurar de backup verificado
5. **Post-mortem**: documentar, melhorar, sem blame

---

*Consolidado de: API_SECURITY, AUTH_SECURITY, INPUT_VALIDATION, DEPENDENCY_SECURITY, RAG_SECURITY, SECURE_CODING_STANDARD, TENANT_ISOLATION, SECURITY_OBSERVABILITY, SECURITY_CHECKLIST, THREAT_MODEL, INCIDENT_RESPONSE.*
