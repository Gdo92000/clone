# COMPACTION POLICY — Cognitive Lifecycle Management

Política de gerenciamento de ciclo de vida do conhecimento no vault cognitivo.

## Objectives

- Prevent knowledge base bloat
- Keep retrieval efficient (sub-second)
- Maintain low token counts for boot
- Automatically archive obsolete content
- Ensure operational files remain current

## Zones and Lifetimes

| Zone | Examples | Retention | Actions |
|------|----------|-----------|---------|
| **EPHEMERAL** | `wiki/log.md`, `00-SYSTEM/evals/`, `docs/obsidian/archive/` | 30 days | Truncate/delete old entries |
| **OPERATIONAL** | `CURRENT_STATE.md`, `MEMORY.md`, index files | 90 days | Compact, prune stale entries |
| **PROTECTED** | `04-AGENTS/`, `03-ENGINEERING/` | indefinite | Manual cleanup only |
| **IMMUTABLE** | `00-SYSTEM/`, `kernel/` | forever | No changes without override |

## Compaction Triggers

- **On every agent session end**: compact `MEMORY.md` (remove entries older than 90 days, compress nested structures)
- **On every pre-push**: run cognitive GC in ephemeral zones
- **Weekly**: auto-archive deprecated files (status: deprecated) to `docs/obsidian/archive/YYYY-MM-DD/`
- **On profile load**: validate that bootstrap token count < limit (express: 2000, full: 5000, audit: 8000, complete: 12000)

## Retrieval Efficiency Rules

1. **Bootstrap Limit**: The `bootstrap` array in profile.json must not exceed token limit. `validate-profile-efficiency.ps1` enforces this.
2. **Lazy Loading**: All non-bootstrap documents must be loaded on-demand via MCP `read` tool, not preloaded.
3. **Cache Expiry**: Index files (`_index.md`) are cached for 1 day; after that, re-read from disk.
4. **Exclusion Patterns**: Profiles may specify `retrieval.exclude` glob patterns to skip entire subtrees during lazy loading.

## Archival Criteria

A file becomes candidate for auto-archive when:
- Frontmatter has `status: deprecated` or `archived: true`
- Last accessed (via `git log -1 -- <file>`) > 90 days
- File size < 100KB (large files are kept but may be compressed)

Archived files are moved to `docs/obsidian/archive/<date>/<original-path>` and original is replaced with a stub:
```markdown
---
archived: true
archive_date: 2026-05-28
location: archive/2026-05-28/docs/.../file.md
---
# Arquivo arquivado
Conteúdo movido para: `archive/2026-05-28/docs/.../file.md`
```

## Garbage Collection Schedule

- **Ephemeral purge**: Every Sunday 00:00, truncate `wiki/log.md` to last 200 entries, delete `00-SYSTEM/evals/workspace/iteration-*/` older than 7 days.
- **Operational compaction**: Monthly (first Monday), run `scripts/compaction/compact-memory.ps1` and `scripts/compaction/compact-indexes.ps1`.
- **Full audit**: Quarterly, run `scripts/gc/cognitive-gc.ps1 --full` to identify orphaned files, broken links, and candidates for archive.

## Monitoring

- Token count boot: measured by `scripts/cognition-cost-wiki.ps1`
- Retrieval latency: log MCP read times (future)
- Vault size: `du -sh docs/obsidian/` should stay < 50MB

## Enforcement

- `pre-push` hook runs `validate-profile-efficiency.ps1` (must pass)
- `pre-commit` hook warns if adding new file to `docs/obsidian/` exceeding 50KB (soft limit)
- CI pipeline runs `cognitive-gc.ps1 --dry-run` and fails if orphan count > 10

## Exceptions

Large binary assets (images, datasets) should be stored in `docs/obsidian/assets/` and excluded from GC. Add `assets/` to `.gitignore` if appropriate.

---

Policy version: 1.0  
Last updated: 2026-05-28
