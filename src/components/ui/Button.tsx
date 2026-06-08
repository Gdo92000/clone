import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { Icon } from './Icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
  intent?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses = {
  solid: {
    primary: 'bg-brand-primary text-text-inverse hover:bg-brand-primary-hover',
    secondary: 'bg-brand-secondary text-text-inverse hover:opacity-90',
    danger: 'bg-feedback-error text-text-inverse hover:opacity-90',
    success: 'bg-feedback-success text-text-inverse hover:opacity-90',
  },
  outline: {
    primary: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-text-inverse',
    secondary: 'border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-text-inverse',
    danger: 'border-2 border-feedback-error text-feedback-error hover:bg-feedback-error hover:text-text-inverse',
    success: 'border-2 border-feedback-success text-feedback-success hover:bg-feedback-success hover:text-text-inverse',
  },
  ghost: {
    primary: 'text-text-primary hover:bg-surface-background',
    secondary: 'text-text-secondary hover:bg-surface-background',
    danger: 'text-feedback-error hover:bg-surface-background',
    success: 'text-feedback-success hover:bg-surface-background',
  },
};

const sizeClasses = {
  sm: 'h-9 px-4 text-sm min-h-[44px]',
  md: 'h-10 px-4 text-base min-h-[44px]',
  lg: 'h-12 px-6 text-lg',
  xl: 'h-14 px-8 text-xl',
};

export function Button({
  className,
  variant = 'solid',
  intent = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150',
        'active:scale-[0.98] active:transition-transform active:duration-75',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant][intent],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={Boolean(disabled) || loading}
      {...props}
    >
      {loading && <Icon name="Loader" className="animate-spin" size={16} />}
      {children}
    </button>
  );
}

export default Button;