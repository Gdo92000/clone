/* Merchant backoffice order status */
export type MerchantOrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'rejected';

/* Customer-facing order status (tracking page) */
export type OrderStatusType = 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered';

export interface OrderStatusStep {
  status: OrderStatusType;
  label: string;
  time?: string;
}

/* Delivery person status */
export type DeliveryStatus = 'available' | 'accepted' | 'picked_up' | 'in_route' | 'delivered';

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  available: 'Disponivel',
  accepted: 'Aceita',
  picked_up: 'Coletada',
  in_route: 'Em rota',
  delivered: 'Entregue',
};

export const DELIVERY_STATUS_FLOW: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  available: 'accepted',
  accepted: 'picked_up',
  picked_up: 'delivered',
  in_route: 'delivered',
};

/* Unified order status for state machine */
export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  new: ['accepted', 'rejected'],
  accepted: ['preparing'],
  preparing: ['ready'],
  ready: ['dispatched'],
  dispatched: ['delivered'],
  confirmed: ['preparing'],
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  accepted: 'Aceito',
  preparing: 'Preparando',
  ready: 'Pronto',
  dispatched: 'Saiu para entrega',
  delivered: 'Entregue',
  rejected: 'Recusado',
  confirmed: 'Confirmado',
};