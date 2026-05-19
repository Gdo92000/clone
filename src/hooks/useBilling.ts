import { useQuery } from '@tanstack/react-query';
import { getInvoices } from '../repositories/subscriptionRepository';
import type { BillingInvoice } from '../modules/saas/types';

export function useBilling() {
  const { data: invoices = [] } = useQuery<BillingInvoice[]>({
    queryKey: ['saas', 'invoices'],
    queryFn: getInvoices,
    staleTime: 1000 * 60 * 10,
  });
  return { invoices };
}
