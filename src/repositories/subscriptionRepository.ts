import type { SaasPlan, SaasAddon, CompanySubscription, BillingInvoice } from '../modules/saas/types';
import { saasPlans, saasAddons, companySubscriptions, billingInvoices } from '../modules/saas/saasData';
import { subscriptionApi } from '../api';

const useMock = __USE_MOCK__;

export async function getPlans(): Promise<SaasPlan[]> {
  return useMock ? saasPlans : subscriptionApi.getPlans();
}

export async function getAddons(): Promise<SaasAddon[]> {
  return useMock ? saasAddons : subscriptionApi.getAddons();
}

export async function getSubscriptions(): Promise<CompanySubscription[]> {
  return useMock ? companySubscriptions : subscriptionApi.getSubscriptions();
}

export async function getInvoices(): Promise<BillingInvoice[]> {
  return useMock ? billingInvoices : subscriptionApi.getInvoices();
}

export async function getSubscriptionByCompany(companyId: string): Promise<CompanySubscription | undefined> {
  if (useMock) return companySubscriptions.find((s) => s.companyId === companyId);
  return subscriptionApi.getSubscriptionByCompany(companyId);
}

export { calculateSubscriptionTotal } from '../modules/saas/saasAccess';