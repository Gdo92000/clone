---
tags:
- type/memory
- domain/auth
created: 2026-05-23
alias: MEMORY
---

# Session Memory

> [!info] Arquivado
> A memória da sessão original está arquivada em [[sources-MEMORY]]. A memória operacional consolidada está em [[MEMORY|Obsidian MEMORY]].

![[sources-MEMORY]]

---

## Workflow — Como manter a memória atualizada

### A cada sessão

1. **Antes de começar**: ler [[MEMORY|Obsidian MEMORY]] para recuperar contexto
2. **Durante o trabalho**: registrar decisões, bugs encontrados, arquivos alterados
3. **Ao finalizar**: atualizar [[MEMORY|Obsidian MEMORY]] + [[CURRENT_STATE]]

### Notas de evolução

As notas de evolução (como `Proximity Feature — Correções e Testes.md`) são criadas em `docs/obsidian/` com:

- **Tags** refletindo o domínio da alteração
- **Data de criação** no frontmatter
- **Resumo do que foi alterado**, arquivos tocados, tabela de validação (tsc, tests, build, lint)
- **Status da feature** e próximos passos sugeridos

### Checklist de finalização de sessão

- [ ] MEMORY.md atualizado (obsidian/MEMORY.md)
- [ ] CURRENT_STATE.md atualizado
- [ ] Nota de evolução criada em `docs/obsidian/`
- [ ] `tsc -b --noEmit` ✅
- [ ] `vitest run` ✅
- [ ] `vite build` ✅

---

## Notas de evolução existentes

- [[Proximity Feature — Correções e Testes]]
