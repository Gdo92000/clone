import { useMerchantAnalytics } from '../../../hooks/useMerchantAnalytics';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxLineChart } from '../../../components/charts/FxLineChart';
import { FxPieChart } from '../../../components/charts/FxPieChart';
import { formatCurrency } from '../format';

export function MerchantAnalyticsPage() {
  const { data, isLoading } = useMerchantAnalytics(30);

  const statusData = data
    ? Object.entries(data.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <>
      <PageHeader title="Analytics" />
      {isLoading ? (
        <p className="text-sm text-text-secondary">Carregando...</p>
      ) : data ? (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">Receita</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(data.revenue)}</p>
            </article>
            <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">Ticket medio</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(data.avgTicket)}</p>
            </article>
            <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">Pedidos (30d)</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{data.orderCount}</p>
            </article>
            <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">Entregues</p>
              <p className="mt-2 text-2xl font-bold text-feedback-success">{data.statusBreakdown['delivered'] ?? 0}</p>
            </article>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <h2 className="mb-4 font-semibold text-text-primary">Receita diaria</h2>
              <FxLineChart data={data.ordersByDay} />
            </div>
            <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <h2 className="mb-4 font-semibold text-text-primary">Status dos pedidos</h2>
              <FxPieChart data={statusData} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
