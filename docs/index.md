---
title: Index — Re-exports
aliases:
- Barrel Exports
- Index Pattern
- Re-export
tags:
- type/knowledge
- domain/architecture
created_at: 2026-05-24
updated_at: 2026-05-24
---

# Index — Re-exports

Vários módulos do código utilizam o padrão **barrel export** (`index.ts`), re-exportando componentes, hooks e utilitários de forma centralizada.

Este arquivo serve como alvo dos wikilinks `[[index]]` gerados automaticamente nas notas de componentes a partir dos imports de barrel files.

## Padrão

```typescript
// index.ts
export { ComponentA } from './ComponentA';
export { ComponentB } from './ComponentB';
```

Isso permite imports limpos:

```typescript
import { ComponentA, ComponentB } from './components';
```

> [!tip] Navegação
> [[MOC — UI Primitives]] · [[MOC — Arquitetura do Sistema]] · [[MOC Index]] · [[Vault Index]]
