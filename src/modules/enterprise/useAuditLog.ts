import { usePersistentState } from '../../hooks/usePersistentState';
import { auditEvents } from './enterpriseData';
import type { AuditEvent } from './types';

export function useAuditLog() {
  const [events, setEvents] = usePersistentState<AuditEvent[]>('enterprise.auditEvents', auditEvents);

  const recordAudit = (actorId: string, action: string, target: string) => {
    const createdAt = new Date().toLocaleString('pt-BR');
    setEvents((current) => [
      { id: `audit-${Date.now()}`, actorId, action, target, createdAt },
      ...current,
    ]);
  };

  return { events, recordAudit };
}
