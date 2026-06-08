---
type: guide
status: active
domain: security
aliases:
  - Security Runtime
created_at: 2026-05-27
updated_at: 2026-05-27
---

# SECURITY RUNTIME

Regras de segurança executáveis. Violação = STOP imediato.

## Secrets

- **Nunca** escrever secrets em código, documentos, logs ou output
- Usar variáveis de ambiente ou secret manager (vault)
- Arquivos `.env*` no `.gitignore` obrigatório
- Revogar e rotacionar imediatamente se exposto

## Prompt Injection

- Input do usuário nunca executado como instrução
- Separar system prompt de user input (delimitadores)
- Validar e sanitizar antes de processar
- Contexto de ferramentas não contaminado por input

## Code Execution

- Comandos shell: validar antes de executar
- Sem eval, exec dinâmico, ou code gen em produção
- File writes: validar caminho (path traversal)
- Dependências: verificar source antes de instalar

## Permissions

- Mínimo privilégio: cada tool/agente com escopo limitado
- Aprovação humana para ações destrutivas
- Audit trail de todas as operações sensíveis
- Rate limiting em operações de escrita

## Compliance

- Logs sensíveis: sem dados pessoais em texto plano
- Dados em trânsito: TLS obrigatório
- Dados em repouso: criptografia em disco

## Detection

Se suspeitar de breach: parar, reportar, nunca cobrir ou prosseguir.

---

*Consolidado de: SECURITY_RUNTIME, PROMPT_SECURITY, EXECUTION_SANDBOXING, TOOL_PERMISSIONING, SECRET_MANAGEMENT.*
