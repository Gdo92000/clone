import { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../merchant/format';
import { useCourierDeliveries, useUpdateDeliveryStatus } from '../../../hooks/useCourierData';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

const MOCK_BRANCH_ADDRESS = 'Rua do Restaurante, 100 - Centro';

export function CourierRoutePage() {
  const { data: orders = [], isLoading, error } = useCourierDeliveries();
  const updateStatus = useUpdateDeliveryStatus();
  const [completedStops, setCompletedStops] = useState<Set<string>>(new Set());

  const route = orders.map((o, idx) => ({
    orderId: o.id,
    customer: o.customerName,
    address: o.customerAddress,
    distanceKm: o.total > 50 ? 5.1 + idx * 0.8 : 3.4 + idx * 0.5,
    earnings: o.total * 0.15,
    completed: completedStops.has(o.id),
  }));

  const toggleStop = (orderId: string) => {
    const isCompleted = completedStops.has(orderId);
    setCompletedStops((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
    updateStatus.mutate({
      orderId,
      deliveryStatus: isCompleted ? 'in_route' : 'delivered',
    });
  };

  const completedCount = route.filter((s) => s.completed).length;
  const totalKm = route.reduce((sum, s) => sum + s.distanceKm, 0);

  return (
    <FxQueryBoundary isLoading={isLoading} isError={error !== null} error={error}>
      <PageHeader title="Roteirização" />
      <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-surface-background p-3">
            <p className="text-sm text-text-secondary">Paradas</p>
            <p className="text-lg font-bold text-text-primary">{completedCount}/{route.length}</p>
          </div>
          <div className="rounded-lg bg-surface-background p-3">
            <p className="text-sm text-text-secondary">Distancia total</p>
            <p className="text-lg font-bold text-text-primary">{totalKm.toFixed(1)} km</p>
          </div>
        </div>

        {route.length === 0 ? (
          <p className="text-sm text-text-secondary">Nenhuma entrega disponivel para roteirizacao.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Restaurante (origem) — {MOCK_BRANCH_ADDRESS}</span>
            </div>

            {route.map((stop, idx) => (
              <div key={stop.orderId} className="relative pl-6">
                <div className={`absolute left-[5px] top-4 h-full w-0.5 ${idx < route.length - 1 ? 'bg-border-default' : ''}`} />
                <div className={`h-3 w-3 rounded-full border-2 absolute left-0 top-1.5 ${
                  stop.completed
                    ? 'border-green-500 bg-green-500'
                    : 'border-blue-500 bg-surface-background'
                }`} />
                <article className={`rounded-xl border p-4 ${stop.completed ? 'border-green-200 bg-green-50' : 'border-border-default bg-surface-background'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-semibold ${stop.completed ? 'text-green-700' : 'text-text-primary'}`}>
                        Parada {idx + 1}: {stop.customer}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">{stop.address}</p>
                      <div className="mt-2 flex gap-3 text-xs text-text-secondary">
                        <span>{stop.distanceKm.toFixed(1)} km</span>
                        <span>{formatCurrency(stop.earnings)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      intent={stop.completed ? 'danger' : 'primary'}
                      onClick={() => { toggleStop(stop.orderId); }}
                    >
                      {stop.completed ? 'Reabrir' : 'Concluir'}
                    </Button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>
    </FxQueryBoundary>
  );
}
