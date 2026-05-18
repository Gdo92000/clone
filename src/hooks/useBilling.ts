import { usePersistentState } from './usePersistentState';
import { billingInvoices } from '../modules/saas/saasData';
import type { BillingInvoice } from '../modules/saas/types';

export function useBilling() {
  const [invoices] = usePersistentState<BillingInvoice[]>('saas.invoices', billingInvoices);
  return { invoices };
}