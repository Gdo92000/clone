import { resolveFeatureAccess } from './saasAccess';
import { useSaasWorkspace } from './useSaasWorkspace';
import type { FeatureKey } from './types';

export function useFeatureAccess(companyId: string, featureKey: FeatureKey, branchId?: string) {
  const { plans, addons, subscriptions, overrides } = useSaasWorkspace();

  return resolveFeatureAccess({
    companyId,
    ...(branchId !== undefined ? { branchId } : {}),
    featureKey,
    plans,
    addons,
    subscriptions,
    overrides,
  });
}
