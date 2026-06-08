---
type: router
status: active
domain: memory
layer: L1
immutable: false
zone: OPERATIONAL
semantic_priority: 5
tags:
  - memory/router
  - retrieval/boot
created_at: 2026-05-28
updated_at: 2026-05-28
---

# BOOT ROUTER — Demand-Loaded Cognitive Memory

> **ÚNICA FONTE CANÔNICA.** A duplicada em `00-SYSTEM/BOOT_ROUTER.md` foi removida. Toda orquestração de bootstrap e retrieval usa exclusivamente este documento.

## Bootstrap Sequence (Minimal)

Load ONLY in this order:
1. AGENTS.md
2. STATE_ACTIVA.md (gerado, HOT — fases ativas apenas)
3. BOOT_ROUTER.md (este documento)
4. TASK_CLASSIFIER.md

> `CURRENT_STATE.md` é a view histórica completa (COLD, gerada) — não inclui no boot. Carregue sob demanda quando a tarefa exigir retrospectiva (intent=audit/planning).

All other docs must be loaded on demand via capability manifests.

## Profile Bootstrap

**Única fonte canônica: `.opencode/profile.json`.** Os limites são declarados exclusivamente em `profile.json`. Este documento não duplica valores — apenas referencia.

| Perfil  | Bootstrap | Ref |
|---------|-----------|-----|
| `express` | AGENTS + **STATE_ACTIVA** + BOOT_ROUTER + TASK_CLASSIFIER | `profile.json:profiles.express` |
| `full`    | + PROJECT-OPERATING-SYSTEM/_index.md | `profile.json:profiles.full` |
| `audit`   | + 02-ARCHITECTURE/_index + 08-SECURITY/_index | `profile.json:profiles.audit` |
| `complete`| + 04-AGENTS/_index | `profile.json:profiles.complete` |

MEMORY.md não participa do bootstrap (estava vazio). STATE_ACTIVA.md substitui CURRENT_STATE.md como HOT (Memory v2). Capabilities sem manifesto próprio agora exigem manifest (fallback para full profile removido).

## Retrieval Rules

- After boot, classify task via TASK_CLASSIFIER.md
- Determine primary capability (`capabilities/<cap>.manifest.json`)
- Retrieve ONLY docs/skills explicitly allowed by the manifest
- Max retrieval depth: 2 (não cascade automático)
- Max files per task: 10
- No cascade loading — cada documento deve ser explicitamente autorizado pelo manifest
- Never load full wiki, full index, or full skill sets

## Capability Manifests

Toda capability classificada pelo TASK_CLASSIFIER.md deve possuir um manifest em `.opencode/capabilities/<cap>.manifest.json`. Sem manifest = sem retrieval scoped.

Manifests definem:
- `allowed_docs_patterns` — globs dos documentos permitidos
- `forbidden_docs_patterns` — globs explicitamente bloqueados
- `allowed_skills` — skills permitidas
- `max_working_tokens` — orçamento de retrieval

## Hot/Warm/Cold

- HOT (always loaded): the four boot files listed above
- WARM: docs matching manifest patterns (load on demand)
- COLD: archive/, logs/, deprecated/, evals/, templates not in use

## Emergency Expansion

If token budget exceeded:
1. Compact long documents (summarize)
2. Drop lowest priority (semantic_priority)
3. Request override via CONTEXT_BUDGET_GOVERNANCE.md

## Validation

Run `scripts/retrieval-validator.ps1` after tasks to verify scope compliance.

## References

- LLM Wiki pattern: `docs/obsidian/wiki/patterns/llm-wiki/SKILL.md`
- Capability manifests: `.opencode/capabilities/*.manifest.json`
- Task classifier: `TASK_CLASSIFIER.md`
