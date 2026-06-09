export type MerchantOrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'rejected';

export type CustomerOrderStatus = 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';

export const MERCHANT_ORDER_TRANSITIONS: Record<MerchantOrderStatus, readonly MerchantOrderStatus[]> = {
  new: ['accepted', 'rejected'],
  accepted: ['preparing'],
  preparing: ['ready'],
  ready: ['dispatched', 'delivered'],
  dispatched: ['delivered'],
  delivered: [],
  rejected: [],
};

export const CUSTOMER_ORDER_TRANSITIONS: Record<CustomerOrderStatus, readonly CustomerOrderStatus[]> = {
  confirmed: ['preparing'],
  preparing: ['ready'],
  ready: ['dispatched'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: MerchantOrderStatus, to: MerchantOrderStatus): boolean {
  return (MERCHANT_ORDER_TRANSITIONS[from] as readonly MerchantOrderStatus[]).includes(to);
}

export function validateTransition(from: MerchantOrderStatus, to: MerchantOrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid order status transition: ${from} → ${to}`);
  }
}

export function isTerminalStatus(status: MerchantOrderStatus): boolean {
  return MERCHANT_ORDER_TRANSITIONS[status].length === 0;
}

export const MERCHANT_ORDER_LABELS: Record<MerchantOrderStatus, string> = {
  new: 'Novo',
  accepted: 'Aceito',
  preparing: 'Preparando',
  ready: 'Pronto',
  dispatched: 'Saiu para entrega',
  delivered: 'Entregue',
  rejected: 'Recusado',
};

export const CUSTOMER_ORDER_LABELS: Record<CustomerOrderStatus, string> = {
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  dispatched: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};
