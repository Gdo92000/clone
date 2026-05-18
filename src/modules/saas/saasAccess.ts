import type { CompanySubscription, FeatureFlagOverride, FeatureKey, SaasAddon, SaasPlan } from './types';

interface ResolveFeatureAccessInput {
  companyId: string;
  branchId?: string;
  featureKey: FeatureKey;
  plans: SaasPlan[];
  addons: SaasAddon[];
  subscriptions: CompanySubscription[];
  overrides: FeatureFlagOverride[];
}

export function resolveFeatureAccess({
  companyId,
  branchId,
  featureKey,
  plans,
  addons,
  subscriptions,
  overrides,
}: ResolveFeatureAccessInput) {
  const subscription = subscriptions.find((item) => item.companyId === companyId);
  const globalOverride = overrides.find(
    (item) => !item.companyId && !item.branchId && !item.userId && item.featureKey === featureKey
  );

  if (globalOverride) {
    return {
      enabled: globalOverride.enabled,
      source: 'global_flag',
      reason: globalOverride.reason,
    };
  }

  if (!subscription || ['blocked', 'cancelled', 'past_due'].includes(subscription.billingStatus)) {
    return {
      enabled: false,
      source: 'billing',
      reason: subscription?.blockedReason ?? 'Assinatura indisponivel.',
    };
  }

  const override = overrides.find(
    (item) =>
        item.companyId === companyId &&
      item.featureKey === featureKey &&
      (!item.branchId || item.branchId === branchId)
  );

  if (override) {
    return {
      enabled: override.enabled,
      source: override.branchId ? 'branch_flag' : 'company_flag',
      reason: override.reason,
    };
  }

  const plan = plans.find((item) => item.id === subscription.planId);
  const planIncludesFeature = !!plan?.includedFeatures.includes(featureKey);
  const addonIncludesFeature = subscription.addonIds.some((addonId) => {
    const addon = addons.find((item) => item.id === addonId);
    return addon?.featureKey === featureKey;
  });

  return {
    enabled: planIncludesFeature || addonIncludesFeature,
    source: addonIncludesFeature ? 'addon' : 'plan',
    reason: planIncludesFeature
      ? `Incluso no plano ${plan?.name}.`
      : addonIncludesFeature
        ? 'Ativado por addon.'
        : 'Recurso nao contratado.',
  };
}

export function calculateSubscriptionTotal(
  subscription: CompanySubscription,
  plans: SaasPlan[],
  addons: SaasAddon[]
) {
  const plan = plans.find((item) => item.id === subscription.planId);
  const addonTotal = subscription.addonIds.reduce((sum, addonId) => {
    const addon = addons.find((item) => item.id === addonId);
    return sum + (addon?.monthlyPrice ?? 0);
  }, 0);

  return (plan?.monthlyPrice ?? 0) + addonTotal;
}
