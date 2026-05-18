import { useCompanies } from '../../../hooks/useMerchantData';
import { calculateSubscriptionTotal, useSaasWorkspace } from '../../saas';
import type { BillingStatus, PlanId } from '../../saas';
import { formatCurrency } from '../../merchant/format';
import { useAuthSession } from '../../auth';
import { useAuditLog } from '../../enterprise';
import { PageHeader } from '../../../components/ui/PageHeader';

const billingLabels: Record<BillingStatus, string> = {
  trial: 'Trial',
  active: 'Ativa',
  past_due: 'Vencida',
  blocked: 'Bloqueada',
  cancelled: 'Cancelada',
};

export function SubscriptionsPage() {
  const { data: companies = [] } = useCompanies();
  const { plans, addons, subscriptions, setSubscriptions } = useSaasWorkspace();
  const { currentUser } = useAuthSession();
  const { recordAudit } = useAuditLog();

  const updatePlan = (companyId: string, planId: PlanId) => {
    setSubscriptions((current) =>
      current.map((subscription) =>
        subscription.companyId === companyId ? { ...subscription, planId } : subscription
      )
    );
    recordAudit(currentUser?.id ?? 'system', 'Alterou plano', `${companyId}:${planId}`);
  };

  const updateStatus = (companyId: string, billingStatus: BillingStatus) => {
    setSubscriptions((current) =>
      current.map((subscription) =>
        subscription.companyId === companyId
          ? (({ blockedReason: _br, ...rest }) => ({
              ...rest,
              billingStatus,
              ...(billingStatus === 'blocked' ? { blockedReason: 'Bloqueio manual do Superadmin.' } : {}),
            }))(subscription)
          : subscription
      )
    );
    recordAudit(currentUser?.id ?? 'system', 'Alterou status financeiro', `${companyId}:${billingStatus}`);
  };

  const toggleAddon = (companyId: string, addonId: string) => {
    setSubscriptions((current) =>
      current.map((subscription) => {
        if (subscription.companyId !== companyId) {
          return subscription;
        }

        const addonIds = subscription.addonIds.includes(addonId)
          ? subscription.addonIds.filter((item) => item !== addonId)
          : [...subscription.addonIds, addonId];

        return { ...subscription, addonIds };
      })
    );
    recordAudit(currentUser?.id ?? 'system', 'Alterou addon', `${companyId}:${addonId}`);
  };

  return (
    <><PageHeader title="Assinaturas por empresa" />
      <section className="space-y-4">
        {subscriptions.map((subscription) => {
          const company = companies.find((item) => item.id === subscription.companyId);

          return (
            <article key={subscription.companyId} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="font-semibold text-text-primary">{company?.name}</h2>
                  <p className="text-sm text-text-secondary">
                    {billingLabels[subscription.billingStatus]} - ciclo ate {subscription.currentPeriodEndsAt}
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
                    value={subscription.planId}
                    onChange={(event) => { updatePlan(subscription.companyId, event.target.value as PlanId); }}
                    className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                  </select>
                  <select
                    value={subscription.billingStatus}
                    onChange={(event) => { updateStatus(subscription.companyId, event.target.value as BillingStatus); }}
                    className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
                  >
                    {Object.entries(billingLabels).map(([status, label]) => (
                      <option key={status} value={status}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {addons.map((addon) => {
                  const active = subscription.addonIds.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => { toggleAddon(subscription.companyId, addon.id); }}
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
    </>
  );

}

