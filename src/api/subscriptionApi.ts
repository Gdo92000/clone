import { get } from './httpClient';
import type { SubscriptionPlanDTO, SubscriptionAddonDTO, CompanySubscriptionDTO, BillingInvoiceDTO } from '../dto/subscriptionDto';

export const subscriptionApi = {
  getPlans: () => get<SubscriptionPlanDTO[]>('/plans'),
  getAddons: () => get<SubscriptionAddonDTO[]>('/addons'),
  getSubscriptions: () => get<CompanySubscriptionDTO[]>('/subscriptions'),
  getInvoices: () => get<BillingInvoiceDTO[]>('/invoices'),
  getSubscriptionByCompany: (companyId: string) =>
    get<CompanySubscriptionDTO>(`/companies/${companyId}/subscription`),
};