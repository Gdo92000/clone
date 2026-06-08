---
type: policy
status: active
domain: core
zone: COLD
aliases:
  - Output Economy
created_at: 2026-06-02
updated_at: 2026-06-02
---

# Output Economy Policy

> Politica global de economia de tokens de saida do agente.
> Carregada como `cold_docs` em todas as capabilities (regra transversal).
> Programaticamente validada em `scripts/memory/lint.ts` via `output-budget.policy.json`.

## Preamble (max 240 chars)

- **Nunca** repetir o input do usuario antes da resposta.
- **Nunca** comecar com "Aqui esta...", "Baseado em...", "Vou...".
- **Sempre** ir direto ao ponto: secao, tabela ou codigo primeiro.
- Preambulo so e justificado se explicar uma restricao nao obvia (ex.: "limitado a 5K tokens").

## Estrutura

- **Tabelas** > listas quando >3 items do mesmo tipo.
- **Subsecoes** (`##`) por topico distinto; max 3-4 subsecoes por resposta.
- **Codigo** com `file_path:line_number` quando referenciar codigo existente.
- **Callouts** Obsidian (callout blocks) para warnings/decisoes, nao prosa.

## Compressao de lists

- Listar max 5 items inline; resumir ("+3 mais") a partir do 6o.
- Em tools (`grep`, `glob`), truncar saida em 20 linhas; mencionar total se maior.
- Nunca ecoar JSON/blob inteiro do usuario; referenciar e resumir.

## Linguagem

- Portugues para docs/comentarios/chat; ingles para chaves de schema, ids, paths.
- Sem emoji (exceto se usuario pedir explicitamente).
- Sem "por favor", "obrigado", "espero que ajude" — superfluos.
- Numeros/paths/ids em monospace; code blocks para snippets >=2 linhas.

## Tamanho de resposta

| Tipo | Budget max | Justificativa |
|------|------------|---------------|
| bugfix | 8K | Diagnostico + patch + teste |
| feature | 16K | Spec + implementacao + validacao |
| refactor | 32K | Multi-arquivo, plano + execucao |
| audit | 16K | Lista de issues + plano de remediação |
| plan | 16K | Roadmap, fases, milestones |
| research | 16K | Q&A, exploracao |
| test | 8K | Spec + codigo de teste |
| deploy | 8K | Comandos + checklist |

Se resposta estourar budget: aplicar compressao L2 (resumir secoes, agrupar tabelas) ANTES de truncar.

## Boas praticas

- **Citar arquivo** com `path/to/file.ts:42` em vez de copiar trecho.
- **Diff > copy/paste** ao propor mudanca: mostrar antes/depois com `+`/`-`.
- **Numerar planos** (1, 2, 3) em vez de prosa corrida.
- **Reusar tabelas do codebase** (ex.: `STATE_ACTIVA.md`) em vez de regenerar.
