import { useQuery } from '@tanstack/react-query';
import { getPlans } from '../repositories/subscriptionRepository';
import type { SubscriptionPlanDTO } from '../dto/subscriptionDto';
import { saasKeys } from '../api/queryKeys';

export function usePlans() {
  return useQuery<SubscriptionPlanDTO[]>({
    queryKey: saasKeys.plans,
    queryFn: getPlans,
    staleTime: 1000 * 60 * 10,
  });
}
