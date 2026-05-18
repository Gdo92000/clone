/* eslint-disable react-refresh/only-export-components */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { buttonVariants, type ButtonVariantProps } from './FxButton.classes';

export { buttonVariants };
export type { ButtonVariantProps };

export interface FxButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function FxButton({
  className,
  variant,
  intent,
  size,
  children,
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: FxButtonProps) {
  return (
    <button
      className={clsx(
        buttonVariants({ variant, intent, size }),
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export default FxButton;