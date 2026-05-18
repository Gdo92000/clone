import type { ReactNode } from 'react';
import { useFeatureAccess } from './useFeatureAccess';
import type { FeatureKey } from './types';

interface FeatureRouteProps {
  companyId: string;
  branchId?: string;
  featureKey: FeatureKey;
  children: ReactNode;
}

export function FeatureRoute({ companyId, branchId, featureKey, children }: FeatureRouteProps) {
  const access = useFeatureAccess(companyId, featureKey, branchId);

  if (access.enabled) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface-background p-4">
      <div className="mx-auto max-w-2xl rounded-xl border border-border-default bg-surface-elevated p-6 text-center">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Recurso indisponivel
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{access.reason}</p>
        <p className="mt-4 text-sm text-text-secondary">
          O Superadmin pode liberar por plano, addon ou feature flag.
        </p>
      </div>
    </div>
  );
}
