import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../merchant/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useCourierDeliveries } from '../../../hooks/useCourierData';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { DELIVERY_STATUS_LABELS, DELIVERY_STATUS_FLOW } from '../../../types';

interface DeliveryItem {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  status: string;
  earnings: number;
  distanceKm: number;
}

export function CourierDeliveriesPage() {
  const { data: hookData = [], isLoading, error } = useCourierDeliveries();
  const [advancements, setAdvancements] = useState<Record<string, number>>({});

  const deliveries: DeliveryItem[] = hookData.map((o, idx) => {
    const progress = advancements[o.id] ?? 0;
    const statuses: string[] = ['available', 'in_route', 'delivered'];
    return {
      id: `ENT-${1024 - idx}`,
      orderId: o.id,
      customerName: o.customerName,
      address: o.customerAddress,
      status: statuses[Math.min(progress, statuses.length - 1)]!,
      earnings: idx === 0 ? 8.5 : 10.25,
      distanceKm: idx === 0 ? 3.4 : 5.1,
    };
  });

  const advanceStatus = (orderId: string) => {
    setAdvancements((prev) => ({ ...prev, [orderId]: (prev[orderId] ?? 0) + 1 }));
  };

  return (
    <FxQueryBoundary isLoading={isLoading} isError={error !== null} error={error}>
    <><PageHeader title="Entregas" />
      <section className="space-y-3">
        {deliveries.map((delivery) => (
          <article key={delivery.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold text-text-primary">{delivery.id} - {delivery.orderId}</p>
                <p className="mt-1 text-sm text-text-secondary">{delivery.customerName}</p>
                <p className="text-sm text-text-secondary">{delivery.address}</p>
              </div>
              <div className="md:text-right">
                <p className="font-semibold text-text-primary">{formatCurrency(delivery.earnings)}</p>
                <p className="text-sm text-text-secondary">{delivery.distanceKm} km</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-background px-3 py-1 text-sm font-medium text-text-primary">
                {DELIVERY_STATUS_LABELS[delivery.status as keyof typeof DELIVERY_STATUS_LABELS]}
              </span>
              {DELIVERY_STATUS_FLOW[delivery.status as keyof typeof DELIVERY_STATUS_FLOW] && (
                <Button size="sm" onClick={() => { advanceStatus(delivery.orderId); }}>
                  Avancar entrega
                </Button>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
    </FxQueryBoundary>
  );
}