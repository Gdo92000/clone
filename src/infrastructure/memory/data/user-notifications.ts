export const mockUserNotifications = [
  { id: 'un-1', userId: 'user-5', title: 'Pedido confirmado', message: 'Seu pedido #order-1 foi confirmado', type: 'order' as const, read: false, createdAt: new Date().toISOString() },
  { id: 'un-2', userId: 'user-5', title: 'Pedido entregue', message: 'Seu pedido #order-4 foi entregue', type: 'order' as const, read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'un-3', userId: 'user-5', title: 'Ganhe pontos', message: 'Você ganhou 100 pontos de fidelidade', type: 'promotion' as const, read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];
