import { get } from './httpClient';
import type { SaasPlan, SaasAddon, CompanySubscription, BillingInvoice } from '../modules/saas/types';

export const subscriptionApi = {
  getPlans: () => get<SaasPlan[]>('/plans'),
  getAddons: () => get<SaasAddon[]>('/addons'),
  getSubscriptions: () => get<CompanySubscription[]>('/subscriptions'),
  getInvoices: () => get<BillingInvoice[]>('/invoices'),
  getSubscriptionByCompany: (companyId: string) =>
    get<CompanySubscription>(`/companies/${companyId}/subscription`),
};