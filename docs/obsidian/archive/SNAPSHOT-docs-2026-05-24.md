---
type: archive
status: active
created_at: 2026-05-24
updated_at: 2026-05-24
title: Snapshot Estrutural docs/ — 2026-05-24
tags:
  - type/snapshot
  - domain/core
description: Snapshot pré-reorganização. Usar para rollback se conectividade piorar.
---

# Snapshot Estrutural — docs/

Capturado antes da reorganização semântica. Data: 2026-05-24.

## Baseline metrics

| Metric | Value |
|--------|-------|
| Total .md files | 204 |
| Total non-.md files | 13 |
| Total bytes (.md) | ~396 KB |
| Total lines (.md) | 13,349 |
| Directories | 12 |
| Broken wikilinks | 29 |
| Zero-backlink orphans | 0 |
| Files with `type:` | 66 (32.5%) |
| Files with `domain:` | 16 (7.9%) |
| Files with `layer:` | 12 (5.9%) |
| BOM-corrupted files | 41 |
| Files missing frontmatter | 1 (`sources/clone.md`) |

## File tree

### Root (12 files)
API.md, ARCHITECTURE.md, CONFIGURATION.md, DATABASE.md, DEVELOPMENT.md, FRONTEND_BACKEND_CONTRACT.md, GETTING-STARTED.md, TESTING.md, Wiki Central.md, index.md, kitchen-auto-print-addon.md, routes.md

### assets/ (2 files)
nearby-desktop.png, nearby-mobile-results.png

### components/ (109 .md)
110 component docs (109 files + Component Index)

### guides/ (1 file)
Guides Index.md

### sources/ (16 files, 5 .md + 11 non-.md)
clone.md, contexto.md, PRINTING_ARCHITECTURE.md, PRODUCTION-READINESS.md, Sources Index.md
- Debris: __check_db.mjs, _auth_stderr.txt, _auth_stdout.txt, _auth2_err.txt, _auth2_out.txt, _auth3_err.txt, _auth3_out.txt, _server_err.txt, server_err.txt, server_log.txt, server_out.txt

### obsidian/ (77 .md files across 7 subdirs)
See full tree above.

## Wikilink map (summary)

- Total unique targets: 235
- Valid: 206
- Broken: 29 (26 in Vault-Graph-Analysis-2026-05-23.md)
- Em-dash broken links: 9 (all referencing `—` vs `-`)
- Path-based broken: 11 (`docs/`, `mocs/_index`, `system/_index`)
- Accent mismatches: 2 (Obsidian-tolerant)
- Typos: 4
- Truly missing files: 3 (hookName, new-name, nota_inexistente — intentional)

## Frontmatter gaps

| Field | Has it | Missing |
|-------|--------|---------|
| type: | 66 | 137 |
| domain: | 16 | 187 |
| layer: | 12 | 191 |
| tags: | 188 | 15 |
| aliases: | 49 | 154 |
| created_at | 66 | 137 |
| updated_at | 66 | 137 |
