import { useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/Button';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { formatCurrency } from '../../merchant/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { getCourierDeliveries } from '../courierData';
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
  const [deliveries, setDeliveries] = usePersistentState<DeliveryItem[]>('courier.deliveries', []);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    void getCourierDeliveries().then(setDeliveries);
  }, [setDeliveries]);

  const advanceStatus = (deliveryId: string) => {
    setDeliveries((current) =>
      current.map((delivery) => {
        const next = DELIVERY_STATUS_FLOW[delivery.status as keyof typeof DELIVERY_STATUS_FLOW];
        return delivery.id === deliveryId && next ? { ...delivery, status: next } : delivery;
      })
    );
  };

  return (
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
                <Button size="sm" onClick={() => { advanceStatus(delivery.id); }}>
                  Avancar entrega
                </Button>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}