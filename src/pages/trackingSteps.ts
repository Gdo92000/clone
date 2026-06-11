import type { OrderStatusStep } from '../components/commerce/FxOrderStatus';

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
