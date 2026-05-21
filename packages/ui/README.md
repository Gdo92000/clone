# `@fluxds/ui`

React component library for the Flux Delivery multi-profile SaaS platform. Built on top of `@fluxds/tokens` design tokens and styled with Tailwind CSS v4 via `tailwind-variants`.

## Components

| Component | Description | Export |
|-----------|-------------|--------|
| `FxButton` | Button with variant, intent, and size props + loading/disabled states | `@fluxds/ui` |
| `FxText` | Polymorphic text primitive with variant, size, color, weight props | `@fluxds/ui` |
| `FxInput` | Form input with label, hint, error, icon slots, forwardRef | `@fluxds/ui` |

Variants objects (`buttonVariants`, `textVariants`) are re-exported for use with `class-variance-authority` or direct styling.

## Context / Providers

| Export | Purpose |
|--------|---------|
| `ThemeProvider` | Light / dark / system theme context. Toggles `.dark` class on `<html>`. |
| `useTheme` | Returns `{ theme, resolvedTheme, setTheme }`. |

Wrap your app root with `ThemeProvider`:

```tsx
import { ThemeProvider } from '@fluxds/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
      <Router />
    </ThemeProvider>
  );
}
```

## Usage

```tsx
import { FxButton, FxText, FxInput } from '@fluxds/ui';
import { useTheme } from '@fluxds/ui';

function MyForm() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <FxText variant="display" size="2xl" weight="bold">
        Sign In
      </FxText>

      <FxInput label="Email" placeholder="you@example.com" size="md" />

      <FxButton variant="solid" intent="primary" size="lg" fullWidth>
        Submit
      </FxButton>
    </div>
  );
}
```

The package is consumed via **relative imports** in the monorepo (no build step):

```ts
import { FxButton } from '../../packages/ui/src';
// or for a single component:
import { FxInput } from '../../packages/ui/src/primitives/FxInput';
```

## Theming / Styling

All components reference Tailwind CSS class names derived from `@fluxds/tokens`:

- **Colors**: `brand-primary`, `brand-secondary`, `surface-background`, `surface-elevated`, `text-primary`, `text-secondary`, `text-inverse`, `feedback-{success,warning,error,info}`, `border-default`, `border-focus`
- **Typography**: font families `font-display` (Nunito), `font-body` (Inter), `font-mono` (JetBrains Mono)
- **Spacing / Radii**: standard Tailwind scale, `rounded-lg`

The `%` suffix in tokens (e.g. `border-brand-primary`) maps to these theme names. The consuming app's `tailwind.config` must map them via `@fluxds/tokens` values.

`tailwind-variants` (`tv`) with `twMerge: true` handles variant composition and class deduplication. `clsx` is used for conditional classes.

## Adding a new component

1. Create `src/primitives/Fx<Name>/` directory.
2. Add component file, optional `.classes.ts` (for `tv` variants), and `index.ts`.
3. Export from `src/primitives/index.ts` and optionally from `src/index.ts`.

**Structure:**

```
src/primitives/Fx<Name>/
├── index.ts           # re-export
├── Fx<Name>.tsx       # component implementation
└── Fx<Name>.classes.ts # tailwind-variants (optional)
```

Follow existing conventions: use `forwardRef` for form controls, `tailwind-variants` for variant props, `clsx` for conditional merging.
