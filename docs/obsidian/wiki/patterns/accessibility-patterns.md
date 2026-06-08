---
type: pattern
status: active
domain: wiki
layer: L3
created_at: 2026-05-31
updated_at: 2026-05-31
tags:
  - accessibility
  - wcag
  - keyboard
  - a11y
---

# Accessibility Patterns

## Problema

Aplicações web frequentemente excluem usuários com deficiência: foco invisível, navegação por teclado quebrada, contraste insuficiente, falta de semântica ARIA e ausência de suporte a leitores de tela.

## Solução

### Componente modal acessível (WCAG 2.1 SC 4.1.2)

```tsx
import { useEffect, useRef, useCallback } from 'react'

function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab') {
        // Traps focus within dialog
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement
      document.addEventListener('keydown', handleKeyDown)
      // Move focus to first focusable inside dialog
      requestAnimationFrame(() => {
        dialogRef.current
          ?.querySelector<HTMLElement>('button, [href], input')
          ?.focus()
      })
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus.current?.focus()
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div ref={dialogRef} className="rounded-xl bg-white p-6 shadow-xl w-full max-w-md">
        <h2 id="dialog-title" className="text-lg font-semibold">{title}</h2>
        <div className="mt-4">{children}</div>
        <button onClick={onClose} className="mt-6 rounded bg-blue-600 px-4 py-2 text-white">
          Fechar
        </button>
      </div>
    </div>
  )
}
```

### Contraste de cor e foco visível

```css
/* Garante que elementos focáveis tenham outline visível */
:focus-visible {
  outline: 2px solid var(--color-blue-600);
  outline-offset: 2px;
}

/* Remove outline apenas quando não for navegação por teclado */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Navegação por teclado com listas

```tsx
function MenuList({ items }: { items: MenuItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, items.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    }
  }

  return (
    <ul role="menu" onKeyDown={handleKeyDown} className="flex flex-col gap-1">
      {items.map((item, i) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={i === activeIndex ? 0 : -1}
          aria-current={i === activeIndex ? 'true' : undefined}
          ref={i === activeIndex ? el => el?.focus() : undefined}
          className="rounded px-3 py-2 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          {item.label}
        </li>
      ))}
    </ul>
  )
}
```

## Trade-offs

- **Focus trapping**: essencial para modais, mas implementação manual é propensa a bugs; prefira `<dialog>` nativo com `showModal()`.
- **`:focus-visible`**: navegadores antigos (IE11) não suportam; use polyfill ou fallback com outline permanente.
- **`aria-*`**  excessivo**: ARIA só é necessária quando HTML semântico não resolve. `<button>` vs `<div role="button">`.
- **Testes manuais**: ferramentas automatizadas (axe, Lighthouse) pegam ~30% dos problemas; o resto exige teste com leitor de tela real.

## Fontes

- [WCAG 2.2 — Understanding Docs](https://www.w3.org/WAI/WCAG22/Understanding/)
- [A11y Project — Checklist](https://www.a11yproject.com/checklist/)
- [MDN — ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
