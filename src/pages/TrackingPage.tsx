import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FxOrderStatus, type OrderStatusStep } from '../components/commerce/FxOrderStatus';
import { FxPriceTag } from '../components/commerce/FxPriceTag';
import { FxPageNavbar } from '../components/navigation/FxPageNavbar';
import { Button } from '../components/ui/Button';
import { useSSEOrderTracking } from '../hooks/useSSE';
import { useOrderTracking } from '../hooks/useOrderTracking';
import { useOrder } from '../hooks/useOrder';
import { FxQueryBoundary } from '../components/ui/FxQueryBoundary';
import { formatCurrency } from '../modules/merchant/format';
import { ROUTES } from '../lib/routes';

export function getStatusSteps(deliveryType: string): OrderStatusStep[] {
  const steps: OrderStatusStep[] = [
    { status: 'confirmed', label: 'Pedido confirmado' },
    { status: 'preparing', label: 'Preparando seu pedido' },
    { status: 'ready', label: deliveryType === 'pickup' ? 'Pronto para retirada' : 'Pedido pronto' },
    { status: 'delivered', label: 'Entregue' },
  ];
  if (deliveryType !== 'pickup') {
    steps.splice(3, 0, { status: 'dispatched', label: 'Saiu para entrega' });
  }
  return steps;
}

export function statusToStep(status: string | undefined, deliveryType: string): number {
  if (!status) return 0;
  const steps = getStatusSteps(deliveryType);
  const idx = steps.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

export function TrackingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('order') ?? undefined;

  const { data, isLoading, isError } = useOrder(orderId, { refetchInterval: 30000 });
  const deliveryType = data?.order.delivery_type ?? 'delivery';

  const steps = useMemo<OrderStatusStep[]>(() => {
    const statusIndex = statusToStep(data?.order.status, deliveryType);
    return getStatusSteps(deliveryType).map((s, i) => (i <= statusIndex ? { ...s, time: 'agora' } : s));
  }, [data?.order.status, deliveryType]);

  const sseTracking = useSSEOrderTracking({
    steps,
    ...(data?.order.restaurant_id ? { branchId: data.order.restaurant_id } : {}),
  });
  const pollingTracking = useOrderTracking({ steps, pollingInterval: 30000 });
  const currentStatus = sseTracking.connected ? sseTracking.currentStatus : pollingTracking.currentStatus;
  const connected = sseTracking.connected;

  const orderItems = data?.items ?? [];
  const total = data?.order ? Number(data.order.total) : 0;
  const restaurantName = data?.order.restaurant_name ?? '';
  const address = data?.address;

  if (!orderId) {
    return (
      <div className="min-h-screen bg-surface-background">
        <FxPageNavbar title="Acompanhar Pedido" backTo={ROUTES.HOME} />
        <main className="max-w-lg mx-auto px-4 py-8 text-center">
          <p className="text-text-secondary">Nenhum pedido em andamento.</p>
          <Button variant="outline" intent="primary" className="mt-4" onClick={() => { void navigate(ROUTES.HOME); }}>
            Voltar ao início
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-background">
      <FxPageNavbar title="Acompanhar Pedido" backTo={ROUTES.HOME} />
      <main>
        <FxQueryBoundary isLoading={isLoading} isError={isError} error={(data as unknown as Error | null) ?? null}>
        <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {connected && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Tempo real" />}
              <p className="text-sm text-text-secondary">Pedido</p>
            </div>
            <p className="text-lg font-bold text-text-primary">#{orderId}</p>
            {restaurantName && <p className="text-sm text-text-tertiary">{restaurantName}</p>}
          </div>

          <FxOrderStatus currentStatus={currentStatus} steps={steps} estimatedTime="35-40 min" />

          <div className="p-4 rounded-xl bg-surface-elevated border border-border-default">
            <h3 className="font-semibold text-text-primary mb-3">Itens do pedido</h3>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{item.quantity}x {item.name}</span>
                  <FxPriceTag price={Number(item.price)} size="sm" />
                </div>
              ))}
            </div>
            <div className="border-t border-border-default mt-3 pt-3 flex justify-between">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="font-bold text-text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {address && (
            <div className="p-4 rounded-xl bg-surface-elevated border border-border-default">
              <h3 className="font-semibold text-text-primary mb-2">Endereço de entrega</h3>
              <p className="text-sm text-text-secondary">{address.street}, {address.number}</p>
              <p className="text-sm text-text-secondary">{address.neighborhood ? `${address.neighborhood} - ` : ''}{address.city} - {address.state}</p>
              {address.zip_code && <p className="text-sm text-text-tertiary">CEP {address.zip_code}</p>}
            </div>
          )}

          {currentStatus === 'dispatched' && (
            <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <span className="text-2xl">{'\u{1F3D7}\uFE0F'}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">Seu entregador</p>
                  <p className="text-sm text-text-secondary">A caminho</p>
                </div>
                <Button variant="outline" intent="secondary" size="sm" onClick={() => { void navigate(ROUTES.SUPPORT); }}>Contactar</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button variant="outline" intent="secondary" className="w-full" onClick={() => { void navigate(ROUTES.HOME); }}>
              Fazer novo pedido
            </Button>
            <Button variant="ghost" intent="danger" className="w-full" onClick={() => { void navigate(ROUTES.ORDERS); }}>Ver meus pedidos</Button>
          </div>
        </div>
        </FxQueryBoundary>
      </main>
    </div>
  );
}

export default TrackingPage;
