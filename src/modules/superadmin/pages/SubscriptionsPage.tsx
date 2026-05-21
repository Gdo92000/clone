import { useCompanies } from '../../../hooks/useMerchantData';
import {
  useSaasSubscriptions,
  useSaasAddonsList,
  useSaasPlansList,
  useUpdateSubscriptionPlan,
  useUpdateSubscriptionStatus,
  useToggleSubscriptionAddon,
} from '../../../hooks/useSuperadminData';
import { calculateSubscriptionTotal } from '../../saas';
import { formatCurrency } from '../../merchant/format';
import { useAuthSession } from '../../auth';
import { useAuditLog } from '../../enterprise';
import type { PlanId, FeatureKey } from '../../saas/types';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { PageHeader } from '../../../components/ui/PageHeader';

type BillingStatus = 'trial' | 'active' | 'past_due' | 'blocked' | 'cancelled';

const billingLabels: Record<BillingStatus, string> = {
  trial: 'Trial',
  active: 'Ativa',
  past_due: 'Vencida',
  blocked: 'Bloqueada',
  cancelled: 'Cancelada',
};

export function SubscriptionsPage() {
  const { data: companies = [], isLoading, error } = useCompanies();
  const { currentUser } = useAuthSession();
  const { recordAudit } = useAuditLog();

  const { data: subscriptions = [] } = useSaasSubscriptions();
  const { data: addonDTOs = [] } = useSaasAddonsList();
  const { data: planDTOs = [] } = useSaasPlansList();

  const addons = addonDTOs.map(a => ({
    id: a.id,
    name: a.name,
    monthlyPrice: Number(a.monthly_price),
    featureKey: a.category as FeatureKey,
    description: a.description,
  }));

  const plans = planDTOs.map(p => ({
    id: p.id as PlanId,
    name: p.name,
    monthlyPrice: Number(p.monthly_price),
    description: p.description,
    includedFeatures: [] as FeatureKey[],
    limits: { branches: p.max_branches, products: p.max_products, users: p.max_users, campaigns: p.max_campaigns },
  }));

  const updatePlanMutation = useUpdateSubscriptionPlan(recordAudit, currentUser?.id);
  const updateStatusMutation = useUpdateSubscriptionStatus(recordAudit, currentUser?.id);
  const toggleAddonMutation = useToggleSubscriptionAddon();

  return (
    <><PageHeader title="Assinaturas por empresa" />
    <FxQueryBoundary isLoading={isLoading} isError={!!error} error={error}>
      <section className="space-y-4">
        {subscriptions.map((subscription: any) => {
          const company = companies.find((item) => item.id === subscription.company_id);
          return (
            <article key={subscription.company_id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="font-semibold text-text-primary">{company?.name}</h2>
                  <p className="text-sm text-text-secondary">
                    {billingLabels[subscription.billing_status as BillingStatus] || 'Desconhecido'} - ciclo ate {subscription.current_period_ends_at}
                  </p>
                  <p className="mt-2 font-bold text-text-primary">
                    {formatCurrency(calculateSubscriptionTotal(subscription, plans, addons))}/mes
                  </p>
                  <p className="mt-1 text-sm text-brand-secondary">
                    Proration simulado: {formatCurrency(calculateSubscriptionTotal(subscription, plans, addons) / 30)} por dia restante.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <select
                    value={subscription.plan_id}
                    onChange={(event) => { updatePlanMutation.mutate({ companyId: subscription.company_id, planId: event.target.value }); }}
                    className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                  >
                    {plans.map((plan: any) => (
                      <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                  </select>
                  <select
                    value={subscription.billing_status}
                    onChange={(event) => { updateStatusMutation.mutate({ companyId: subscription.company_id, billingStatus: event.target.value }); }}
                    className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                  >
                    {Object.entries(billingLabels).map(([status, label]) => (
                      <option key={status} value={status}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {addons.map((addon: any) => {
                  const active = subscription.addon_ids?.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => { toggleAddonMutation.mutate({ subscriptionId: subscription.company_id, addonId: addon.id }); }}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        active ? 'bg-brand-secondary text-text-inverse' : 'bg-surface-background text-text-secondary'
                      }`}
                    >
                      {addon.name}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </FxQueryBoundary>
    </>
  );
}
