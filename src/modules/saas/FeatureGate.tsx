import type { ReactNode } from 'react';
import { useFeatureAccess } from './useFeatureAccess';
import type { FeatureKey } from './types';

interface FeatureGateProps {
  companyId: string;
  branchId?: string;
  featureKey: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({
  companyId,
  branchId,
  featureKey,
  children,
  fallback = null,
}: FeatureGateProps) {
  const access = useFeatureAccess(companyId, featureKey, branchId);

  return access.enabled ? <>{children}</> : <>{fallback}</>;
}
