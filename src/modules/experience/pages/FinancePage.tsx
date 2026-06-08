import { formatCurrency } from '../../merchant/format';
import { useConsumerOrders } from '../../../hooks/useConsumerData';
import type { OrderDTO } from '../../../api/consumerApi';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { ExperienceLayout } from '../components/ExperienceLayout';

function orderToFinanceRow(order: OrderDTO, index: number) {
  return {
    id: `fin-${index}`,
    title: `Pedido #${order.id}`,
    amount: Number(order.total),
    detail: order.status ? `Status: ${order.status}` : 'Pedido realizado',
  } as const;
}

export function FinancePage() {
  const { data: orders = [], isLoading } = useConsumerOrders();

  const financeRows = orders.map(orderToFinanceRow);

  return (
    <ExperienceLayout title="Financeiro">
      <FxQueryBoundary isLoading={isLoading} isError={false}>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {financeRows.map((row) => (
            <article key={row.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">{row.title}</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(row.amount)}</p>
              <p className="mt-1 text-sm text-text-secondary">{row.detail}</p>
            </article>
          ))}
        </section>
      </FxQueryBoundary>
    </ExperienceLayout>
  );
}
