import { useCompanies } from '../../../hooks/useMerchantData';
import { calculateSubscriptionTotal, useSaasWorkspace } from '../../saas';
import { formatCurrency } from '../../merchant/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { platformMetrics } from '../superadminData';

export function SuperadminDashboardPage() {
  const { data: companies = [] } = useCompanies();
  const { plans, addons, subscriptions, invoices } = useSaasWorkspace();
  const mrr = subscriptions.reduce((sum, s) => sum + calculateSubscriptionTotal(s, plans, addons), 0);
  const activeSubs = subscriptions.filter((s) => s.billingStatus === 'active').length;
  const trials = subscriptions.filter((s) => s.billingStatus === 'trial').length;
  const overdue = invoices.filter((i) => i.status === 'failed' || i.status === 'open').length;

  const metrics = [
    { label: 'Lojas ativas', value: platformMetrics.activeStores, sub: `${platformMetrics.totalStores} cadastradas`, icon: 'Store' },
    { label: 'MRR', value: formatCurrency(mrr), sub: `${platformMetrics.growthRate}% crescimento`, icon: 'TrendingUp' },
    { label: 'Pedidos mensais', value: platformMetrics.monthlyOrders.toLocaleString('pt-BR'), sub: `Ticket médio R$ ${platformMetrics.averageTicket.toFixed(2).replace('.', ',')}`, icon: 'ShoppingBag' },
    { label: 'Churn rate', value: `${platformMetrics.churnRate}%`, sub: `${activeSubs} ativas, ${trials} trials`, icon: 'Users' },
    { label: 'Faturamento total', value: formatCurrency(platformMetrics.totalRevenue), sub: `${overdue} faturas abertas`, icon: 'DollarSign' },
    { label: 'Assinaturas', value: activeSubs, sub: `${subscriptions.length} no total`, icon: 'CreditCard' },
  ];

  return (
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
          <h2 className="font-semibold text-text-primary mb-4">Top lojas</h2>
          <div className="space-y-2">
            {platformMetrics.topStores.map((store, i) => (
              <div key={store.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-background transition-colors">
                <span className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{store.name}</p>
                  <p className="text-xs text-text-tertiary">{store.orders.toLocaleString('pt-BR')} pedidos</p>
                </div>
                <div className="flex items-center gap-1 text-feedback-success text-sm font-medium shrink-0">
                  <Icon name="Star" size={14} fill="currentColor" />
                  {store.rating}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary mb-4">Atividades recentes</h2>
          <div className="space-y-2">
            {platformMetrics.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-background transition-colors">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === 'new_store' ? 'bg-feedback-success/10 text-feedback-success' :
                  activity.type === 'subscription' ? 'bg-feedback-info/10 text-feedback-info' :
                  activity.type === 'payment' ? 'bg-feedback-warning/10 text-feedback-warning' :
                  'bg-brand-primary/10 text-brand-primary'
                }`}>
                  <Icon name={
                    activity.type === 'new_store' ? 'Store' :
                    activity.type === 'subscription' ? 'CreditCard' :
                    activity.type === 'payment' ? 'DollarSign' : 'Tag'
                  } size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{activity.message}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{activity.date}</p>
                </div>
              </div>
            ))}
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
  );
}

export default SuperadminDashboardPage;