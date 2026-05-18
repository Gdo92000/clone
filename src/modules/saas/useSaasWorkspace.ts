import { usePlans } from '../../hooks/usePlans';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useBilling } from '../../hooks/useBilling';
import { usePersistentState } from '../../hooks/usePersistentState';
import { featureFlagOverrides } from './saasData';
import type { FeatureFlagOverride } from './types';

export function useSaasWorkspace() {
  const { plans, setPlans } = usePlans();
  const { addons, setAddons, subscriptions, setSubscriptions } = useSubscriptions();
  const { invoices } = useBilling();
  const [overrides, setOverrides] = usePersistentState<FeatureFlagOverride[]>('saas.featureFlags', featureFlagOverrides);

  return { plans, setPlans, addons, setAddons, subscriptions, setSubscriptions, overrides, setOverrides, invoices };
}