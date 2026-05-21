# @fluxds/tokens

Design tokens for the Flux Delivery design system. Provides colors, typography, spacing, border-radius, and shadows as typed constants.

## Installation

```sh
npm install @fluxds/tokens
```

This package is also available as a workspace dependency (`"@fluxds/tokens": "workspace:*"`).

## Usage

```ts
import { colors, typography, spacing, borderRadius, shadows } from '@fluxds/tokens';
```

Each subpath is also independently importable:

```ts
import { colors } from '@fluxds/tokens/colors';
import { typography } from '@fluxds/tokens/typography';
import { spacing } from '@fluxds/tokens/spacing';
```

### In JSX / CSS-in-JS

```tsx
import { colors, spacing, borderRadius } from '@fluxds/tokens';

const style = {
  backgroundColor: colors.surface.elevated,
  padding: `${spacing[4]} ${spacing[6]}`,
  borderRadius: borderRadius.lg,
  color: colors.text.primary,
};
```

### TypeScript types

All tokens export their inferred types:

```ts
import type { Colors, Typography, Spacing, BorderRadius, Shadow } from '@fluxds/tokens';
```

## Available tokens

### Colors (`colors`)

| Group     | Keys                                                    |
|-----------|---------------------------------------------------------|
| brand     | `primary`, `primaryHover`, `secondary`, `accent`        |
| surface   | `background`, `elevated`, `overlay`, `inverse`          |
| text      | `primary`, `secondary`, `tertiary`, `disabled`, `inverse` |
| feedback  | `success`, `warning`, `error`, `info`                    |
| border    | `default`, `focus`, `error`, `disabled`                  |

### Typography (`typography`)

| Category     | Description                                |
|--------------|--------------------------------------------|
| fontFamily   | `display` (Nunito), `body` (Inter), `mono` (JetBrains Mono) |
| fontSize     | `xs` (0.75rem) through `5xl` (3rem)        |
| fontWeight   | `normal` (400) through `extrabold` (800)    |
| lineHeight   | `tight` (1.25), `normal` (1.5), `relaxed` (1.625) |

### Spacing (`spacing`)

Keys from `0` to `96` (in rem), following a 4px base scale. Access via bracket notation: `spacing[4]` → `'1rem'`.

### Border radius (`borderRadius`)

| Key      | Value     |
|----------|-----------|
| none     | 0         |
| sm       | 0.125rem  |
| DEFAULT  | 0.25rem   |
| md       | 0.375rem  |
| lg       | 0.5rem    |
| xl       | 0.75rem   |
| 2xl      | 1rem      |
| 3xl      | 1.5rem    |
| full     | 9999px    |

### Shadows (`shadows`)

| Key      | Value                                   |
|----------|-----------------------------------------|
| none     | none                                    |
| sm–2xl   | Box-shadow value (multi-layered on md+) |

## Exports

| Entry point                 | Exports                              |
|-----------------------------|--------------------------------------|
| `@fluxds/tokens`            | `colors`, `typography`, `spacing`, `borderRadius`, `shadows` + types |
| `@fluxds/tokens/colors`     | `colors` + `Colors` type             |
| `@fluxds/tokens/typography` | `typography` + `Typography` type     |
| `@fluxds/tokens/spacing`    | `spacing`, `borderRadius`, `shadows` + types |
