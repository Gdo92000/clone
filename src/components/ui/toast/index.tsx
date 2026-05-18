import type { ReactNode } from 'react';

interface ToastActionProps {
  children: ReactNode;
  onClick: () => void;
}

export function ToastAction({ children, onClick }: ToastActionProps) {
  return (
    <button
      onClick={onClick}
      className="mt-2 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
    >
      {children}
    </button>
  );
}