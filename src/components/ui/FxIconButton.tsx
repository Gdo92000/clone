import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { Icon } from './Icon';

export interface FxIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
  intent?: 'primary' | 'secondary' | 'danger' | 'success' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  'aria-label': string;
  children: ReactNode;
}

const variantClasses = {
  solid: {
    primary: 'bg-brand-primary text-text-inverse hover:bg-brand-primary-hover active:bg-brand-primary-pressed',
    secondary: 'bg-brand-secondary text-text-inverse hover:opacity-90 active:opacity-80',
    danger: 'bg-feedback-error text-text-inverse hover:opacity-90 active:opacity-80',
    success: 'bg-feedback-success text-text-inverse hover:opacity-90 active:opacity-80',
    neutral: 'bg-surface-elevated text-text-primary hover:bg-surface-background active:bg-surface-background',
  },
  outline: {
    primary: 'border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-text-inverse active:bg-brand-primary-pressed',
    secondary: 'border border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-text-inverse active:opacity-80',
    danger: 'border border-feedback-error text-feedback-error hover:bg-feedback-error hover:text-text-inverse active:opacity-80',
    success: 'border border-feedback-success text-feedback-success hover:bg-feedback-success hover:text-text-inverse active:opacity-80',
    neutral: 'border border-border-default text-text-primary hover:bg-surface-background active:bg-surface-background',
  },
  ghost: {
    primary: 'text-brand-primary hover:bg-brand-primary/10 active:bg-brand-primary/20',
    secondary: 'text-brand-secondary hover:bg-brand-secondary/10 active:bg-brand-secondary/20',
    danger: 'text-feedback-error hover:bg-feedback-error/10 active:bg-feedback-error/20',
    success: 'text-feedback-success hover:bg-feedback-success/10 active:bg-feedback-success/20',
    neutral: 'text-text-secondary hover:bg-surface-background hover:text-text-primary active:bg-surface-background',
  },
};

const sizeClasses = {
  sm: 'h-9 w-9 min-h-[36px] min-w-[36px]',
  md: 'h-11 w-11 min-h-[44px] min-w-[44px]',
  lg: 'h-14 w-14 min-h-[56px] min-w-[56px]',
};

export function FxIconButton({
  className,
  variant = 'ghost',
  intent = 'neutral',
  size = 'md',
  loading = false,
  disabled,
  children,
  type,
  ...props
}: FxIconButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-95',
        variantClasses[variant][intent],
        sizeClasses[size],
        className
      )}
      disabled={Boolean(disabled) || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Icon name="Loader" className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} /> : children}
    </button>
  );
}

export default FxIconButton;
