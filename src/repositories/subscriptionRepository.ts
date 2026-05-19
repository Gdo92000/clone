import type { SaasPlan, SaasAddon, CompanySubscription, BillingInvoice } from '../modules/saas/types';
import { subscriptionApi } from '../api';

export async function getPlans(): Promise<SaasPlan[]> {
  return subscriptionApi.getPlans();
}

export async function getAddons(): Promise<SaasAddon[]> {
  return subscriptionApi.getAddons();
}

export async function getSubscriptions(): Promise<CompanySubscription[]> {
  return subscriptionApi.getSubscriptions();
}

export async function getInvoices(): Promise<BillingInvoice[]> {
  return subscriptionApi.getInvoices();
}

export async function getSubscriptionByCompany(companyId: string): Promise<CompanySubscription | undefined> {
  return subscriptionApi.getSubscriptionByCompany(companyId);
}

export { calculateSubscriptionTotal } from '../modules/saas/saasAccess';