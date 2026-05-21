import type { PlanId, BillingStatus, FeatureKey } from '../modules/saas/types';

export interface SubscriptionPlanDTO {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  description: string;
  includedFeatures: FeatureKey[];
  limits: {
    branches: number;
    products: number;
    users: number;
    campaigns: number;
  };
}

export interface SubscriptionAddonDTO {
  id: string;
  name: string;
  monthlyPrice: number;
  featureKey: FeatureKey;
  description: string;
}

export interface CompanySubscriptionDTO {
  companyId: string;
  planId: PlanId;
  addonIds: string[];
  billingStatus: BillingStatus;
  trialEndsAt?: string;
  currentPeriodEndsAt: string;
  blockedReason?: string;
}

export interface BillingInvoiceDTO {
  id: string;
  companyId: string;
  amount: number;
  status: 'paid' | 'open' | 'failed';
  dueDate: string;
}
