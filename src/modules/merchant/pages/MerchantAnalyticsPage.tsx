import { useOrders } from '../../../hooks/useMerchantData';
import { MerchantLayout } from '../components/MerchantLayout';
import { formatCurrency } from '../format';

export function MerchantAnalyticsPage() {
  const { data: orders = [] } = useOrders();
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageTicket = orders.length > 0 ? revenue / orders.length : 0;

  return (
    <MerchantLayout title="Analytics Pro">
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Receita analisada</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(revenue)}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Ticket medio</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(averageTicket)}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Pedidos analisados</p>
           <p className="mt-2 text-2xl font-bold text-text-primary">{orders.length}</p>
        </article>
      </section>
    </MerchantLayout>
  );
}
