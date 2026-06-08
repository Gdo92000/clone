import type { AuditEvent } from 'src/domain/entities/AuditEvent';

export const mockAuditEvents: AuditEvent[] = [
  { id: 'audit-1', actorId: 'user-1', actorName: 'Admin Master', action: 'LOGIN', target: 'session', createdAt: new Date().toISOString() },
  { id: 'audit-2', actorId: 'user-2', actorName: 'João Restaurante', action: 'ORDER_UPDATE', target: 'order-2', details: 'Status alterado para preparing', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'audit-3', actorId: 'user-1', actorName: 'Admin Master', action: 'USER_CREATE', target: 'user', details: 'Novo usuário criado: maria@sakura.com', createdAt: new Date(Date.now() - 86400000).toISOString() },
];
