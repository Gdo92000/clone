import { usePersistentState } from './usePersistentState';
import { saasPlans } from '../modules/saas/saasData';
import type { SaasPlan } from '../modules/saas/types';

export function usePlans() {
  const [plans, setPlans] = usePersistentState<SaasPlan[]>('saas.plans', saasPlans);
  return { plans, setPlans };
}