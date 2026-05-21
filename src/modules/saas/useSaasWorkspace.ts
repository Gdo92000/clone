import { useState } from 'react';
import { usePlans } from '../../hooks/usePlans';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useBilling } from '../../hooks/useBilling';
import type { SaasPlan, SaasAddon, CompanySubscription, FeatureFlagOverride } from './types';

export function useSaasWorkspace() {
  const { data: apiPlans = [] } = usePlans();
  const { addons: apiAddons, subscriptions: apiSubscriptions } = useSubscriptions();
  const { invoices } = useBilling();

  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [addons, setAddons] = useState<SaasAddon[]>([]);
  const [subscriptions, setSubscriptions] = useState<CompanySubscription[]>([]);
  const [overrides, setOverrides] = useState<FeatureFlagOverride[]>([]);
  const [hasSyncedPlans, setHasSyncedPlans] = useState(false);
  const [hasSyncedAddons, setHasSyncedAddons] = useState(false);
  const [hasSyncedSubs, setHasSyncedSubs] = useState(false);

  if (apiPlans.length && !hasSyncedPlans) {
    setHasSyncedPlans(true);
    setPlans(apiPlans);
  }

  if (apiAddons.length && !hasSyncedAddons) {
    setHasSyncedAddons(true);
    setAddons(apiAddons);
  }

  if (apiSubscriptions.length && !hasSyncedSubs) {
    setHasSyncedSubs(true);
    setSubscriptions(apiSubscriptions);
  }

  return { plans, setPlans, addons, setAddons, subscriptions, setSubscriptions, overrides, setOverrides, invoices };
}
