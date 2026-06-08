# Cognitive Vault Template

Template de projeto com **POS** (Project Operating System) e **Kernel Imutável** para desenvolvimento com agentes LLM.

## O que é

Este template implementa:
- POS: camadas de governança (00-SYSTEM a 99-TEMPLATES)
- Kernel Imutável: arquivos protegidos por hash e override protocol
- Skills canônicas: 42 habilidades para agentes
- Validação automática: `pos-test-all.ps1`, `validate-kernel.ps1`
- Git hooks: impedem commits que quebrem o kernel

## Como começar

### Opção A: Script de criação de projeto (recomendado)

```powershell
.\scripts\new-project.ps1 -ProjectName "MeuProjeto"
```

O script vai:
- Criar novo diretório
- Copiar arquivos essenciais
- Inicializar git e instalar hooks
- Validar a instalação

### Opção B: Integração em projeto existente (automática)

```powershell
.\scripts\setup-template.ps1
```

O script vai:
- Perguntar nome e descrição do projeto
- Atualizar `CURRENT_STATE.md` automaticamente
- Instalar git hooks
- Analisar skills existentes e atualizar `SKILL_REGISTRY.md`
- Verificar arquitetura demand-loaded
- Executar validação completa
- Exibir relatório de integração

### Opção C: Manual

1. Clone este repositório
2. Copie os arquivos para um novo diretório
3. Edite `docs/obsidian/project-operating-system/CURRENT_STATE.md` com nome/descrição
4. Execute `.\scripts\install-hooks.ps1` para instalar git hooks
5. Rode `.\scripts\pos-test-all.ps1` para verificar

## Arquitetura de Memória Sob Demanda

Este template utiliza uma arquitetura de memória cognitiva *demand-loaded* para manter o custo de tokens baixo e evitar知识 bloat.

### Bootstrap mínimo

O perfil `express` carrega apenas:
- AGENTS.md
- CURRENT_STATE.md
- BOOT_ROUTER.md
- TASK_CLASSIFIER.md

Todos os outros documentos e skills são carregados apenas quando necessários.

### Classificação de tarefas

O `TASK_CLASSIFIER.md` mapeia a tarefa atual para uma *capability* (ex: frontend, backend, testing). Com base nisso, o sistema:
1. Carrega o *capability manifest* (`*.manifest.json`)
2. Permite *retrieval* apenas de documentos e skills listados no manifest
3. Bloqueia acesso a conteúdos fora do escopo

### Scripts auxiliares

- `scripts/load-skill.ps1` — Carrega uma skill sob demanda, validando permissões.
- `scripts/measure-tokens.ps1` — Mede tokens de um arquivo.
- `scripts/check-budget.ps1` — Verifica se o orçamento de tokens permite adicionar mais conteúdo.
- `scripts/retrieval-telemetry.ps1` — Relatório de métricas de retrieval.
- `scripts/retrieval-validator.ps1` — Valida que retrieval respeita os manifests.

### Benefícios

- Boot < 2.000 tokens
- Retrieval médio < 8.000 tokens
- Zero carregamento completo de wiki ou skills
- Scoping determinístico

Consulte `docs/obsidian/project-operating-system/BOOT_ROUTER.md` para detalhes.

## Stress Testing

The template includes a cognitive stress test framework to validate the demand-loaded memory architecture:

```powershell
.\scripts\stress-test\run-all.ps1
```

This runs comprehensive tests for:
- Boot stability (<2K tokens, deterministic)
- Retrieval efficiency (<8K tokens per capability)
- Context expansion (sublinear growth)
- Retrieval pollution (<15% irrelevant)
- Lazy loading enforcement
- Token economy (vs full vault)
- Extreme stress (large vault + concurrency)

Reports are generated in `reports/cognitive-stress-test/`.

## Estrutura de pastas

```
docs/obsidian/
├── project-operating-system/   # POS (governança)
│   ├── _index.md              # Router
│   ├── 00-SYSTEM/             # Contratos imutáveis
│   ├── 04-AGENTS/             # Protocolos de agente
│   └── ...
├── kernel/                    # Kernel imutável (novo)
│   ├── _index.md
│   ├── SCHEMA.md
│   ├── PROTECTED_ZONES.md
│   ├── OVERRIDE_PROTOCOL.md
│   ├── IMMUTABLE_KERNEL.md   # Registry de hashes
│   └── overrides/             # Overrides aprovados
└── wiki/                      # Base de conhecimento
    ├── patterns/llm-wiki/    # Pattern skill
    └── ...

.opencode/
├── ag-kit-main/.agent/        # Agent runtime (skills + agents)
│   ├── skills/               # 42 habilidades canônicas
│   └── agents/               # Definições de agentes
├── skills/                   # DEPRECATED (apenas README)
└── profile.json              # Perfis de bootstrap

scripts/
├── pos-test-all.ps1          # Suíte completa de testes
├── validate-kernel.ps1       # Validação do kernel
├── kernel/request-override.ps1  # Solicitar override
├── install-hooks.ps1         # Instalar git hooks
└── new-project.ps1           # Criar projeto novo (opcional)
```

## Executando agentes

Este template não fornece uma CLI própria; ele é consumido por agentes LLM (Claude Code, OpenCode, etc.) que leem o `AGENTS.md` e o POS.

Para executar:
- Use a CLI do seu agente que suporte o formato AGENTS.md (ex: OpenCode)
- O perfil ativo está em `.opencode/profile.json`
- Consulte a documentação do seu agente para integração

## Testes e validação

```powershell
# Testes completos (POS + kernel)
.\scripts\pos-test-all.ps1

# Apenas validação do kernel
.\scripts\validate-kernel.ps1

# Medição de custo de tokens
.\scripts\cognition-cost-wiki.ps1
```

## Git Hooks

Após `install-hooks.ps1` ou `new-project.ps1`, os seguintes hooks são instalados:

- **pre-commit**: valida integridade do kernel (bloqueia alterações em arquivos imutáveis sem override)
- **pre-push**: executa `pos-test-all.ps1` (bloqueia push se testes falharem)

## Override Protocol

Se precisar modificar um arquivo imutável (`immutable: true`), você **deve**:

1. Executar `.\scripts\kernel\request-override.ps1 -FilePath <caminho> -Reason "<motivo>"`
2. Aprovar o override (o script pode aprovar automaticamente ou você edita depois)
3. O override será registrado em `docs/obsidian/kernel/overrides/` e no `log.md`
4. O `validate-kernel.ps1` reconhecerá o override e permitirá a mudança

 Sem override, o commit será bloqueado pelo hook.

## Customização

- **Perfis**: edite `.opencode/profile.json` para incluir/excluir documentos no boot.
- **Skills**: adicione novas habilidades em `.opencode/ag-kit-main/.agent/skills/` e atualize `04-AGENTS/SKILL_REGISTRY.md`.
- **Camadas**: siga a `00-SYSTEM/LAYER_TAXONOMY.md` para manter a estrutura.

## Referências

- [POS Router](docs/obsidian/project-operating-system/_index.md)
- [Kernel Docs](docs/obsidian/kernel/_index.md)
- [LLM Wiki Pattern](docs/obsidian/wiki/patterns/llm-wiki/SKILL.md)
- [Skill: system-contract-validator](docs/obsidian/wiki/patterns/system-contract-validator/SKILL.md) (exemplo de validação)

## Problemas comuns

- **Hooks não funcionam?** Rode `.\scripts\install-hooks.ps1` manualmente.
- **Validação falha?** Verifique se você modificou algum arquivo imutável; use override se intencional.
- **Skill não encontrada?** Atualize `04-AGENTS/SKILL_REGISTRY.md` ou adicione a skill no runtime.

---

Template maintained under **Immutable Kernel Enforcement**. Preserve invariants.
