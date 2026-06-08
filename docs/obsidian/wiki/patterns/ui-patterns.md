---
type: pattern
status: active
domain: wiki
layer: L3
created_at: 2026-05-31
updated_at: 2026-05-31
tags:
  - ui
  - design-system
  - tailwind
  - responsive
---

# UI Patterns

## Problema

Componentes de UI crescem sem consistência: APIs infladas de props, responsividade ad-hoc com media queries duplicadas, ausência de tokens de design e dificuldade em manter tema unificado entre telas.

## Solução

### Component API: composição + slots nomeados

Cada componente expõe uma API mínima e previsível. Props de estilo (cor, tamanho) são centralizadas via variantes. Slots nomeados permitem customização sem explosão de props.

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const button = cva('inline-flex items-center gap-2 rounded-lg font-medium transition-colors', {
  variants: {
    variant: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      ghost: 'text-gray-600 hover:bg-gray-100',
    },
    size: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

type ButtonProps = VariantProps<typeof button> & {
  children: React.ReactNode
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
}

function Button({ variant, size, children, leftSlot, rightSlot, ...props }: ButtonProps) {
  return (
    <button className={button({ variant, size })} {...props}>
      {leftSlot}
      {children}
      {rightSlot}
    </button>
  )
}
```

### Tailwind v4: CSS-first config

O Tailwind v4 migra de `tailwind.config` para CSS nativo com `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --font-display: "Inter", sans-serif;
  --radius-box: 0.75rem;
}
```

```tsx
// Uso idêntico — tokens viram classes utilitárias
<button className="bg-primary text-white rounded-box px-4 py-2 font-display">
  Enviar
</button>
```

### Responsividade mobile-first

```tsx
// grid responsivo sem media queries explícitas
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id} item={item} />
  ))}
</div>
```

## Trade-offs

- **cva + variants**: adiciona dependência; times pequenos podem preferir CSS modules + classnames simples.
- **Tailwind v4 CSS-first**: quebra compatibilidade com plugins v3; migração exige planejamento.
- **Composição sobre props**: mais JSX, mas cada componente mantém API enxuta e previsível.
- **Responsividade utilitária**: classes ficam longas; prefira extrair para componente se repetir.

## Fontes

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs/v4-beta)
- [CVA — Class Variance Authority](https://cva.style/docs)
