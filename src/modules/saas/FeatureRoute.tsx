import type { ReactNode } from 'react';
import { useFeatureAccess } from './useFeatureAccess';
import type { FeatureKey } from './types';
import { EmptyState } from '../../components/ui/EmptyState';

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
      <div className="mx-auto max-w-2xl rounded-xl border border-border-default bg-surface-elevated">
        <EmptyState
          icon="Lock"
          title="Recurso indisponivel"
          description={access.reason}
          size="lg"
          action={{
            label: 'Falar com o suporte',
            onClick: () => { window.location.href = '/support'; },
            variant: 'solid',
          }}
        />
      </div>
    </div>
  );
}
