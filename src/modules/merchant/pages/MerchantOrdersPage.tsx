import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/ui/PageHeader';
import { MerchantStatusBadge } from '../components/MerchantStatusBadge';
import { formatCurrency } from '../format';
import { useOrders, useBranches, useUpdateOrderStatus } from '../../../hooks/useMerchantData';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import type { MerchantOrder, MerchantOrderStatus } from '../types';

const NEXT_STATUS_MAP: Record<'delivery' | 'pickup', Partial<Record<MerchantOrderStatus, MerchantOrderStatus>>> = {
  delivery: {
    new: 'accepted',
    accepted: 'preparing',
    preparing: 'ready',
    ready: 'dispatched',
    dispatched: 'delivered',
  },
  pickup: {
    new: 'accepted',
    accepted: 'preparing',
    preparing: 'ready',
    ready: 'delivered',
  },
};

function getNextStatus(order: MerchantOrder): MerchantOrderStatus | undefined {
  return NEXT_STATUS_MAP[order.deliveryType][order.status];
}

export function MerchantOrdersPage() {
  const { data: orders = [], isLoading: ordersLoading, isError: ordersError, error: ordersErr } = useOrders();
  const { data: branches = [], isLoading: branchesLoading, isError: branchesError } = useBranches();
  const { mutateAsync: updateOrderStatusAsync, isPending: updateStatusPending } = useUpdateOrderStatus();
  const [branchId, setBranchId] = useState('all');

  // Create a function to update order status that uses the mutation
  const updateStatus = (orderId: string, status: MerchantOrderStatus) => {
    return updateOrderStatusAsync({ orderId, status });
  };

  const filteredOrders = useMemo(
    () => orders.filter((order) => branchId === 'all' || order.branchId === branchId),
    [branchId, orders]
  );

  // Handle loading states
  if (ordersLoading || branchesLoading) {
    return (
      <>
        <PageHeader title="Pedidos recebidos" />
        <section className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary">Carregando pedidos...</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <FxQueryBoundary isLoading={false} isError={ordersError || branchesError} error={ordersErr}>
      <PageHeader
        title="Pedidos recebidos"
        actions={
          <select
            value={branchId}
            onChange={(event) => { setBranchId(event.target.value); }}
            className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            disabled={updateStatusPending}
          >
            <option value="all">Todas as filiais</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        }
      />
      <section className="space-y-3">
        {filteredOrders.map((order) => {
          const branch = branches.find((item) => item.id === order.branchId);
          const statusToApply = getNextStatus(order);

          return (
            <article key={order.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-text-primary">{order.id}</h2>
                    <MerchantStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{branch?.name}</p>
                  <p className="mt-2 text-sm text-text-primary">{order.customerName}</p>
                  <p className="text-sm text-text-secondary">{order.customerAddress}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-semibold text-text-primary">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-text-secondary">{order.paymentMethod} - {order.createdAt}</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-surface-background p-3">
                {order.items.map((item) => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>

               <div className="mt-4 flex flex-wrap gap-2">
                 {order.status === 'new' && (
                   <Button size="sm" variant="outline" intent="danger" onClick={() => { void updateStatus(order.id, 'rejected'); }}>
                     Recusar
                   </Button>
                 )}
                 {statusToApply && (
                   <Button size="sm" onClick={() => { void updateStatus(order.id, statusToApply); }}>
                     Avancar status
                   </Button>
                 )}
               </div>
            </article>
          );
        })}
      </section>
    </FxQueryBoundary>
  );
}
