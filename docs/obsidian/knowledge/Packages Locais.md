---
type: knowledge
status: active
created_at: 2026-05-23
updated_at: 2026-05-23
tags:
  - type/knowledge
  - domain/architecture
---

# Packages Locais

## @fluxds/tokens — tokens de design
```
packages/tokens/
  src/
    colors.ts        → paleta de cores (brand, neutral, semantic)
    typography.ts    → famílias de fonte, tamanhos, pesos
    spacing.ts       → escala de espaçamento (4px base)

Usado em todo o código via import direto (não é npm install)
```

## @fluxds/ui — componentes React reutilizáveis
```
packages/ui/
  src/
    Button.tsx
    FxPriceTag.tsx
    FxDeliveryBadge.tsx
    ...

Importados diretamente (sem pub registry):
  import { Button } from '../../packages/ui/src/Button';
```

### Componentes identificados
- `FxPriceTag` — exibição de preço com coupon/taxa aplicada
- `FxDeliveryBadge` — badge de tempo de entrega com ETA
- `Button` — componente de botão com variants

## Importação — monorepo não-workspaces
```
Este projeto não usa npm workspaces.
Os packages locais são referenciados por caminho relativo,
não por nome de pacote npm.
```

## Extensão futura recomendada
```
packages/shared/      ← schema Zod + tipos compartilhados (backend ↔ frontend)
packages/hooks/       ← hooks reutilizáveis do frontend
packages/utils/ ← funções puras compartilhadas (date, string, math)
```

> [!tip] Navegação
> [[MOC — Arquitetura do Sistema]] · [[MOC — UI Primitives]]
