import type { SubscriptionPlanDTO, SubscriptionAddonDTO, CompanySubscriptionDTO, BillingInvoiceDTO } from '../dto/subscriptionDto';
import { subscriptionApi } from '../api';

export async function getPlans(): Promise<SubscriptionPlanDTO[]> {
  return subscriptionApi.getPlans();
}

export async function getAddons(): Promise<SubscriptionAddonDTO[]> {
  return subscriptionApi.getAddons();
}

export async function getSubscriptions(): Promise<CompanySubscriptionDTO[]> {
  return subscriptionApi.getSubscriptions();
}

export async function getInvoices(): Promise<BillingInvoiceDTO[]> {
  return subscriptionApi.getInvoices();
}

export async function getSubscriptionByCompany(companyId: string): Promise<CompanySubscriptionDTO | undefined> {
  return subscriptionApi.getSubscriptionByCompany(companyId);
}

export { calculateSubscriptionTotal } from '../modules/saas/saasAccess';