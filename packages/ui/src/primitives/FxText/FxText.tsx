/* eslint-disable react-refresh/only-export-components */
import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { tv, type VariantProps } from 'tailwind-variants';

export const textVariants = tv(
  {
    base: 'text-text-primary',
    variants: {
      variant: {
        display: 'font-display font-bold',
        body: 'font-body',
        mono: 'font-mono',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
      },
      color: {
        primary: 'text-text-primary',
        secondary: 'text-text-secondary',
        tertiary: 'text-text-tertiary',
        disabled: 'text-text-disabled',
        inverse: 'text-text-inverse',
        brand: 'text-brand-primary',
        success: 'text-feedback-success',
        warning: 'text-feedback-warning',
        error: 'text-feedback-error',
        info: 'text-feedback-info',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
      },
    },
    defaultVariants: {
      variant: 'body',
      size: 'base',
      color: 'primary',
    },
  },
  { twMerge: true }
);

export type TextVariantProps = VariantProps<typeof textVariants>;
export type TextVariant = NonNullable<TextVariantProps['variant']>;
export type TextSize = NonNullable<TextVariantProps['size']>;
export type TextColor = NonNullable<TextVariantProps['color']>;

type TextElement = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'small';

export interface FxTextProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  children: ReactNode;
  as?: TextElement;
  truncate?: boolean;
}

export function FxText({
  className,
  variant,
  size,
  color,
  weight,
  as: Component = 'p',
  children,
  truncate = false,
  ...props
}: FxTextProps) {
  return (
    <Component
      className={clsx(
        textVariants({ variant, size, color, weight }),
        truncate && 'truncate overflow-hidden text-ellipsis whitespace-nowrap',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default FxText;