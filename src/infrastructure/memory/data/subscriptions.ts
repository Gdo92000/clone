import type { CompanySubscription } from 'src/domain/entities/Plan';

export const mockSubscriptions: CompanySubscription[] = [
  { companyId: 'comp-1', planId: 'pro', addonIds: ['addon-1', 'addon-3'], billingStatus: 'active', trialEndsAt: null as unknown as string, currentPeriodEndsAt: new Date(Date.now() + 25 * 86400000).toISOString() },
  { companyId: 'comp-2', planId: 'premium', addonIds: ['addon-2'], billingStatus: 'active', trialEndsAt: null as unknown as string, currentPeriodEndsAt: new Date(Date.now() + 20 * 86400000).toISOString() },
  { companyId: 'comp-3', planId: 'basic', addonIds: [], billingStatus: 'trial', trialEndsAt: new Date(Date.now() + 10 * 86400000).toISOString(), currentPeriodEndsAt: new Date(Date.now() + 10 * 86400000).toISOString() },
  { companyId: 'comp-4', planId: 'basic', addonIds: [], billingStatus: 'trial', trialEndsAt: new Date(Date.now() + 10 * 86400000).toISOString(), currentPeriodEndsAt: new Date(Date.now() + 10 * 86400000).toISOString() },
];
