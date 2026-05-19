import { formatCurrency } from '../../merchant/format';
import { useCourierDeliveries } from '../../../hooks/useCourierData';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

export function CourierDashboardPage() {
  const { data: orders = [], isLoading, error } = useCourierDeliveries();
  const earnings = (orders as any[]).reduce((sum, o) => sum + (o.total || 0), 0);
  const distance = 0;

  return (
    <><PageHeader title="Resumo do entregador" />
      <FxQueryBoundary isLoading={isLoading} isError={error !== null} error={error}>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Ganhos hoje</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(earnings)}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Entregas</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{orders.length}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Distancia</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{distance.toFixed(1)} km</p>
        </article>
      </section>
      </FxQueryBoundary>
    </>
  );
}