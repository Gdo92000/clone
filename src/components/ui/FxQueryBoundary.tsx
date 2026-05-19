import type { ReactNode } from 'react';

interface FxQueryBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error | null) => ReactNode;
  children: ReactNode;
}

export function FxQueryBoundary({ isLoading, isError, error, onRetry, loadingFallback, errorFallback, children }: FxQueryBoundaryProps) {
  if (isLoading) {
    return loadingFallback ?? (
      <div className="flex items-center justify-center py-12">
        <span className="block h-6 w-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return errorFallback
      ? errorFallback(error ?? null)
      : (
        <div className="rounded-xl border border-feedback-error/30 bg-feedback-error/5 p-6 text-center">
          <p className="text-feedback-error font-medium mb-2">Erro ao carregar dados</p>
          <p className="text-sm text-text-secondary mb-4">{error?.message ?? 'Tente novamente mais tarde.'}</p>
          {onRetry && (
            <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-brand-primary text-text-inverse text-sm font-medium hover:bg-brand-primary-hover transition-colors">
              Tentar novamente
            </button>
          )}
        </div>
      );
  }

  return <>{children}</>;
}
