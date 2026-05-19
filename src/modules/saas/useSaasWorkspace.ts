import { useState, useEffect } from 'react';
import { usePlans } from '../../hooks/usePlans';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useBilling } from '../../hooks/useBilling';
import type { SaasPlan, SaasAddon, CompanySubscription, FeatureFlagOverride } from './types';

export function useSaasWorkspace() {
  const { data: apiPlans = [] } = usePlans();
  const { addons: apiAddons, subscriptions: apiSubscriptions } = useSubscriptions();
  const { invoices } = useBilling();

  const [plans, setPlans] = useState<SaasPlan[]>(apiPlans);
  const [addons, setAddons] = useState<SaasAddon[]>(apiAddons);
  const [subscriptions, setSubscriptions] = useState<CompanySubscription[]>(apiSubscriptions);
  const [overrides, setOverrides] = useState<FeatureFlagOverride[]>([]);

  useEffect(() => { if (apiPlans.length) setPlans(apiPlans); }, [apiPlans]);
  useEffect(() => { if (apiAddons.length) setAddons(apiAddons); }, [apiAddons]);
  useEffect(() => { if (apiSubscriptions.length) setSubscriptions(apiSubscriptions); }, [apiSubscriptions]);

  return { plans, setPlans, addons, setAddons, subscriptions, setSubscriptions, overrides, setOverrides, invoices };
}
