export interface AuditEvent {
  id: string;
  actorId: string;
  actorName?: string;
  action: string;
  target: string;
  targetId?: string;
  details?: string;
  createdAt: string;
  ipAddress?: string;
}
