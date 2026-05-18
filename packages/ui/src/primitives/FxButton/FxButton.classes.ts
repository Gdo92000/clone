import { tv, type VariantProps } from 'tailwind-variants';

export const buttonVariants = tv(
  {
    base: [
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'font-medium',
      'rounded-lg',
      'transition-colors',
      'duration-150',
      'focus:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-brand-primary',
      'focus-visible:ring-offset-2',
      'disabled:pointer-events-none',
      'disabled:opacity-50',
    ],
    variants: {
      variant: {
        solid: 'bg-brand-primary text-text-inverse hover:bg-brand-primary-hover',
        outline:
          'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-text-inverse',
        ghost: 'text-text-primary hover:bg-surface-background',
        link: 'text-brand-primary underline-offset-4 hover:underline',
      },
      intent: {
        primary: '',
        secondary: '',
        danger: '',
        success: '',
      },
      size: {
        xs: 'h-8 px-3 text-xs',
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        intent: 'primary',
        class: 'bg-brand-primary text-text-inverse hover:bg-brand-primary-hover',
      },
      {
        variant: 'solid',
        intent: 'secondary',
        class: 'bg-brand-secondary text-text-inverse hover:opacity-90',
      },
      {
        variant: 'solid',
        intent: 'danger',
        class: 'bg-feedback-error text-text-inverse hover:opacity-90',
      },
      {
        variant: 'solid',
        intent: 'success',
        class: 'bg-feedback-success text-text-inverse hover:opacity-90',
      },
      {
        variant: 'outline',
        intent: 'primary',
        class: 'border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-text-inverse',
      },
      {
        variant: 'outline',
        intent: 'danger',
        class: 'border-feedback-error text-feedback-error hover:bg-feedback-error hover:text-text-inverse',
      },
      {
        variant: 'ghost',
        intent: 'primary',
        class: 'text-brand-primary hover:bg-surface-background',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      intent: 'primary',
      size: 'md',
    },
  },
  { twMerge: true }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;