import type { Notification } from 'src/domain/entities/Notification';

export const mockNotifications: Notification[] = [
  { id: 'notif-1', userId: 'user-1', title: 'Novo pedido', message: 'Pedido #order-1 foi criado', type: 'order', read: false, createdAt: new Date().toISOString() },
  { id: 'notif-2', userId: 'user-1', title: 'Assinatura próxima do vencimento', message: 'Sua assinatura vence em 5 dias', type: 'billing', read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'notif-3', userId: 'user-1', title: 'Avaliação recebida', message: 'Cliente avaliou o pedido #order-4 com 5 estrelas', type: 'order', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];
