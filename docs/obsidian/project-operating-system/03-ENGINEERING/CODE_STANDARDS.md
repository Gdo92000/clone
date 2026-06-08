---
type: guide
status: draft
domain: engineering
layer: L3
semantic_priority: 4
tags:
  - type/guide
  - domain/engineering
  - tech/standards
aliases:
  - Code Standards
created_at: 2026-05-26
updated_at: 2026-05-26
---

# CODE STANDARDS

## GENERAL RULES

Mandatory:

- Strong typing
- Pure functions when possible
- Explicit error handling
- Small modules
- Deterministic behavior

---

## NAMING

### Variables
- Descriptive names only
- No abbreviations without standard meaning

### Functions
- Verb-based names
- Single responsibility

### Classes
- Domain-oriented naming

---

## FILE RULES

- One responsibility per file
- No giant files
- Shared utilities isolated

---

## ERROR HANDLING

Mandatory:

- Explicit error propagation
- Structured error objects
- No swallowed exceptions
- Logging required

---

## TYPESCRIPT RULES

Mandatory:

- strict=true
- no any
- exhaustive switch
- readonly when possible

---

## REACT RULES

Mandatory:

- Smart/dumb separation
- Hooks isolated
- No business logic in UI
- Memoization where justified

---

## BACKEND RULES

Mandatory:

- Thin controllers
- Service isolation
- Repository abstraction
- DTO validation

---

## TEST RULES

Mandatory:

- Arrange / Act / Assert
- Deterministic tests
- No external dependency in unit tests

## Relações

- [[_index|03-ENGINEERING Index]]
- [[02-ARCHITECTURE/ARCHITECTURE_RULES|Architecture Rules]]
- [[03-ENGINEERING/FOLDER_STRUCTURE|Folder Structure]]
