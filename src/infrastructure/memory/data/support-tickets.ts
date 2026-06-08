import type { SupportTicket } from 'src/domain/entities/SupportTicket';

export const mockSupportTickets: SupportTicket[] = [
  { id: 'ticket-1', userId: 'user-2', subject: 'Erro no fechamento do pedido', description: '', status: 'open', priority: 'high', category: 'bug', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ticket-2', userId: 'user-3', subject: 'Dúvida sobre relatórios', description: '', status: 'in_progress', priority: 'medium', category: 'doubts', assignedTo: 'user-1', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ticket-3', userId: 'user-4', subject: 'Problema no aplicativo', description: '', status: 'resolved', priority: 'low', category: 'bug', assignedTo: 'user-1', createdAt: new Date(Date.now() - 604800000).toISOString(), updatedAt: new Date(Date.now() - 604800000).toISOString() },
];
