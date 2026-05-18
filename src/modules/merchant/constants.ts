import type { MerchantOrderStatus } from './types';

export const orderStatusLabels: Record<MerchantOrderStatus, string> = {
  new: 'Novo',
  accepted: 'Aceito',
  preparing: 'Preparando',
  ready: 'Pronto',
  dispatched: 'Saiu para entrega',
  delivered: 'Entregue',
  rejected: 'Recusado',
};
