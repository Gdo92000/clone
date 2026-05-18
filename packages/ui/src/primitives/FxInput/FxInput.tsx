import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useId, type ForwardedRef } from 'react';
import { clsx } from 'clsx';

export interface FxInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-13 px-5 text-lg',
};

function FxInputInner(
  {
    className,
    label,
    hint,
    error,
    size = 'md',
    startIcon,
    endIcon,
    fullWidth = false,
    id,
    disabled,
    ...props
  }: FxInputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hasError = Boolean(error);

  return (
    <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-lg border border-border-default bg-surface-elevated',
            'text-text-primary placeholder:text-text-tertiary',
            'transition-colors duration-150',
            'focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20',
            'disabled:cursor-not-allowed disabled:bg-surface-background disabled:text-text-disabled',
            hasError && 'border-feedback-error focus:border-feedback-error focus:ring-feedback-error/20',
            sizeClasses[size],
            startIcon && 'pl-10',
            endIcon && 'pr-10',
            className
          )}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {endIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {endIcon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-feedback-error">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-sm text-text-secondary">
          {hint}
        </p>
      )}
    </div>
  );
}

export const FxInput = forwardRef(FxInputInner);
FxInput.displayName = 'FxInput';

export default FxInput;