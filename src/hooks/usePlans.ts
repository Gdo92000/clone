import { useQuery } from '@tanstack/react-query';
import { getPlans } from '../repositories/subscriptionRepository';
import type { SaasPlan } from '../modules/saas/types';

export function usePlans() {
  return useQuery<SaasPlan[]>({
    queryKey: ['saas', 'plans'],
    queryFn: getPlans,
    staleTime: 1000 * 60 * 10,
  });
}
