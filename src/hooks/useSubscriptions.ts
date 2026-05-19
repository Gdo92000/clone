import { useQuery } from '@tanstack/react-query';
import { getAddons, getSubscriptions } from '../repositories/subscriptionRepository';
import type { SaasAddon, CompanySubscription } from '../modules/saas/types';

export function useSubscriptions() {
  const addons = useQuery<SaasAddon[]>({
    queryKey: ['saas', 'addons'],
    queryFn: getAddons,
    staleTime: 1000 * 60 * 10,
  });
  const subscriptions = useQuery<CompanySubscription[]>({
    queryKey: ['saas', 'subscriptions'],
    queryFn: getSubscriptions,
    staleTime: 1000 * 60 * 10,
  });
  return { addons: addons.data ?? [], subscriptions: subscriptions.data ?? [] };
}
