import { useState, useEffect } from 'react';
import { formatCurrency } from '../../merchant/format';
import { getCourierDeliveries } from '../courierData';
import { PageHeader } from '../../../components/ui/PageHeader';

export function CourierDashboardPage() {
  const [deliveries, setDeliveries] = useState<Awaited<ReturnType<typeof getCourierDeliveries>>>([]);

  useEffect(() => {
    void getCourierDeliveries().then(setDeliveries);
  }, []);

  const earnings = deliveries.reduce((sum, delivery) => sum + delivery.earnings, 0);
  const distance = deliveries.reduce((sum, delivery) => sum + delivery.distanceKm, 0);

  return (
    <><PageHeader title="Resumo do entregador" />
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Ganhos hoje</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(earnings)}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Entregas</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{deliveries.length}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Distancia</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{distance.toFixed(1)} km</p>
        </article>
      </section>
    </>
  );
}