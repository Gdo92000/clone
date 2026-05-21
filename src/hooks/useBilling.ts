import { useQuery } from '@tanstack/react-query';
import { getInvoices } from '../repositories/subscriptionRepository';
import type { BillingInvoiceDTO } from '../dto/subscriptionDto';
import { saasKeys } from '../api/queryKeys';

export function useBilling() {
  const { data: invoices = [] } = useQuery<BillingInvoiceDTO[]>({
    queryKey: saasKeys.invoices,
    queryFn: getInvoices,
    staleTime: 1000 * 60 * 10,
  });
  return { invoices };
}
