import { Button } from '../../../components/ui/Button';
import { useOrders } from '../../../hooks/useMerchantData';
import { MerchantLayout } from '../components/MerchantLayout';
import { formatCurrency } from '../format';
import { infoToast } from '../../../lib/toast';

const expenses = [
  { id: 'exp-1', label: 'Taxa da plataforma', amount: 38.7 },
  { id: 'exp-2', label: 'Repasse entregadores', amount: 24.5 },
  { id: 'exp-3', label: 'Embalagens', amount: 19.9 },
];

export function MerchantFinancePage() {
  const { data: orders = [] } = useOrders();
  const paidOrders = orders.filter((order) => order.status !== 'rejected');
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const net = revenue - expenseTotal;

  return (
    <MerchantLayout title="Financeiro completo">
      <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Faturamento</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(revenue)}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Despesas</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(expenseTotal)}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Liquido</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(net)}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Pedidos pagos</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{paidOrders.length}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Fluxo de caixa</h2>
          <div className="mt-4 space-y-3">
            {paidOrders.map((order) => (
              <div key={order.id} className="flex justify-between rounded-lg bg-surface-background p-3 text-sm">
                <span>{order.id} - {order.paymentMethod}</span>
                <span className="font-semibold text-feedback-success">{formatCurrency(order.total)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Despesas e conciliacao</h2>
          <div className="mt-4 space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between rounded-lg bg-surface-background p-3 text-sm">
                <span>{expense.label}</span>
                <span className="font-semibold text-feedback-error">{formatCurrency(expense.amount)}</span>
              </div>
            ))}
          </div>
          <Button className="mt-4" variant="outline" onClick={() => { infoToast('Relatório financeiro disponível em breve.'); }}>Exportar relatorio</Button>
        </div>
      </section>
    </MerchantLayout>
  );
}
