---
type: guide
status: draft
domain: engineering
layer: L3
semantic_priority: 4
tags:
  - type/guide
  - domain/engineering
  - tech/structure
aliases:
  - Folder Structure
created_at: 2026-05-26
updated_at: 2026-05-26
---

# FOLDER STRUCTURE

## ROOT

```
/project
  /apps
  /packages
  /services
  /infra
  /scripts
  /docs
  /tests
```

---

## FRONTEND STRUCTURE

```
/apps/web
  /src
    /app
    /pages
    /components
    /features
    /hooks
    /services
    /stores
    /styles
    /types
    /utils
```

---

## BACKEND STRUCTURE

```
/services/api
  /src
    /controllers
    /services
    /repositories
    /entities
    /dtos
    /middlewares
    /events
    /jobs
```

---

## SHARED PACKAGES

```
/packages
  /ui
  /types
  /config
  /utils
```

---

## RULES

Mandatory:

- Shared logic belongs in packages
- Feature modules isolated
- No cross-feature hidden imports
- Infrastructure separated from domain

## Relações

- [[_index|03-ENGINEERING Index]]
- [[03-ENGINEERING/CODE_STANDARDS|Code Standards]]
- [[02-ARCHITECTURE/ARCHITECTURE_RULES|Architecture Rules]]
