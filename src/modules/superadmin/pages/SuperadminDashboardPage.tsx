import { useCompanies } from '../../../hooks/useMerchantData';
import { calculateSubscriptionTotal, useSaasWorkspace } from '../../saas';
import { formatCurrency } from '../../merchant/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { usePlatformMetrics } from '../../../hooks/useSuperadminData';

export function SuperadminDashboardPage() {
  const { data: companies = [], isLoading, isError, error } = useCompanies();
  const { plans, addons, subscriptions, invoices } = useSaasWorkspace();
  const { data: platMetrics } = usePlatformMetrics();
  const mrr = subscriptions.reduce((sum, s) => sum + calculateSubscriptionTotal(s, plans, addons), 0);
  const activeSubs = subscriptions.filter((s) => s.billingStatus === 'active').length;
  const trials = subscriptions.filter((s) => s.billingStatus === 'trial').length;
  const overdue = invoices.filter((i) => i.status === 'failed' || i.status === 'open').length;

  const metrics = [
    { label: 'Lojas ativas', value: platMetrics?.totalCompanies ?? companies.length, sub: `${companies.length} cadastradas`, icon: 'Store' },
    { label: 'MRR', value: formatCurrency(mrr), sub: `${subscriptions.length} assinaturas`, icon: 'TrendingUp' },
    { label: 'Assinaturas ativas', value: activeSubs, sub: `${trials} em trial`, icon: 'ShoppingBag' },
    { label: 'Churn rate', value: `${subscriptions.length > 0 ? ((subscriptions.length - activeSubs) / subscriptions.length * 100).toFixed(1) : 0}%`, sub: `${activeSubs} ativas, ${trials} trials`, icon: 'Users' },
    { label: 'Faturamento total', value: formatCurrency(mrr * 12), sub: `${overdue} faturas abertas`, icon: 'DollarSign' },
    { label: 'Assinaturas', value: activeSubs, sub: `${subscriptions.length} no total`, icon: 'CreditCard' },
  ];

  return (
    <FxQueryBoundary isLoading={isLoading} isError={isError} error={error}>
    <>
      <PageHeader title="Visão SaaS" />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        {metrics.map((m) => (
          <article key={m.label} className="rounded-xl border border-border-default bg-surface-elevated p-4 flex items-start gap-4">
            <span className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Icon name={m.icon} className="text-brand-primary" size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-text-secondary uppercase tracking-wider">{m.label}</p>
              <p className="text-xl font-bold text-text-primary mt-0.5">{m.value}</p>
              <p className="text-xs text-text-tertiary mt-1">{m.sub}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary mb-4">Empresas</h2>
          <div className="space-y-2">
            {companies.slice(0, 5).map((company, i) => (
              <div key={company.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-background transition-colors">
                <span className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{company.name}</p>
                  <p className="text-xs text-text-tertiary">Plano {company.plan}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary mb-4">Assinaturas recentes</h2>
          <div className="space-y-2">
            {subscriptions.slice(0, 5).map((sub) => {
              const company = companies.find((c) => c.id === sub.companyId);
              return (
                <div key={sub.companyId} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-background transition-colors">
                  <span className="w-8 h-8 rounded-full bg-feedback-info/10 text-feedback-info flex items-center justify-center shrink-0">
                    <Icon name="CreditCard" size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">{company?.name ?? sub.companyId}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{sub.billingStatus} - {formatCurrency(calculateSubscriptionTotal(sub, plans, addons))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border-default bg-surface-elevated p-4 mt-6">
        <h2 className="font-semibold text-text-primary mb-4">Empresas monetizadas</h2>
        <div className="space-y-3">
            {subscriptions.map((sub) => {
              const company = companies.find((c) => c.id === sub.companyId);
              const plan = plans.find((p) => p.id === sub.planId);
            return (
              <article key={sub.companyId} className="rounded-lg bg-surface-background p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{company?.name}</p>
                    <p className="text-sm text-text-secondary">Plano {plan?.name} + {sub.addonIds.length} addons</p>
                  </div>
                  <p className="font-semibold text-text-primary">{formatCurrency(calculateSubscriptionTotal(sub, plans, addons))}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
    </FxQueryBoundary>
  );
}

export default SuperadminDashboardPage;