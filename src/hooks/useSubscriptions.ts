import { useQuery } from '@tanstack/react-query';
import { getAddons, getSubscriptions } from '../repositories/subscriptionRepository';
import type { SubscriptionAddonDTO, CompanySubscriptionDTO } from '../dto/subscriptionDto';
import { saasKeys } from '../api/queryKeys';

export function useSubscriptions() {
  const addons = useQuery<SubscriptionAddonDTO[]>({
    queryKey: saasKeys.addons,
    queryFn: getAddons,
    staleTime: 1000 * 60 * 10,
  });
  const subscriptions = useQuery<CompanySubscriptionDTO[]>({
    queryKey: saasKeys.subscriptions,
    queryFn: getSubscriptions,
    staleTime: 1000 * 60 * 10,
  });
  return { addons: addons.data ?? [], subscriptions: subscriptions.data ?? [] };
}
