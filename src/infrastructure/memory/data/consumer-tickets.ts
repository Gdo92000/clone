export const mockConsumerTickets = [
  { id: 'ticket-1', userId: 'user-5', subject: 'Pedido atrasado', description: '', status: 'open' as const, priority: 'high' as const, category: 'delay', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ticket-2', userId: 'user-5', subject: 'Item faltando no pedido', description: '', status: 'resolved' as const, priority: 'medium' as const, category: 'missing_item', assignedTo: 'user-1', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
];
