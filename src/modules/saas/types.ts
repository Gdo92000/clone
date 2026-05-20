export type PlanId = 'basic' | 'pro' | 'premium';

export type BillingStatus = 'trial' | 'active' | 'past_due' | 'blocked' | 'cancelled';

export type FeatureKey =
  | 'advanced_reports'
  | 'campaigns'
  | 'ai_product_descriptions'
  | 'multi_users'
  | 'whatsapp_integration'
  | 'analytics'
  | 'loyalty_program'
  | 'own_delivery'
  | 'coupon_automation'
  | 'priority_support'
  | 'featured_home'
  | 'financial_suite'
  | 'crm'
  | 'api_access'
  | 'white_label'
  | 'team_management'
  | 'kitchen_display'
  | 'kitchen_auto_print'
  | 'internal_courier';

export interface SaasPlan {
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

export interface SaasAddon {
  id: string;
  name: string;
  monthlyPrice: number;
  featureKey: FeatureKey;
  description: string;
}

export interface CompanySubscription {
  companyId: string;
  planId: PlanId;
  addonIds: string[];
  billingStatus: BillingStatus;
  trialEndsAt?: string;
  currentPeriodEndsAt: string;
  blockedReason?: string;
}

export interface FeatureFlagOverride {
  id: string;
  companyId?: string;
  branchId?: string;
  userId?: string;
  featureKey: FeatureKey;
  enabled: boolean;
  reason: string;
}

export interface BillingInvoice {
  id: string;
  companyId: string;
  amount: number;
  status: 'paid' | 'open' | 'failed';
  dueDate: string;
}

export type CapabilityCategory =
  | 'core'
  | 'premium'
  | 'addon'
  | 'enterprise'
  | 'financial'
  | 'automation'
  | 'analytics'
  | 'integration'
  | 'operations';

export type BillingChargeType = 'included' | 'monthly_addon' | 'usage_based' | 'enterprise_contract';

export interface SaasCapability {
  featureKey: FeatureKey;
  name: string;
  description: string;
  monthlyPrice: number;
  dependencies: FeatureKey[];
  category: CapabilityCategory;
  requiredPlan: PlanId;
  chargeType: BillingChargeType;
  relatedLimits: (keyof SaasPlan['limits'] | 'coupons' | 'reports')[];
}
