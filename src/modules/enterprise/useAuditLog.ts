import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/superadminApi';

export function useAuditLog() {
  const { data: events = [] } = useQuery({
    queryKey: ['audit-events'],
    queryFn: () => auditApi.list(),
  });

  const recordAudit = (..._args: unknown[]) => {};

  return { events, recordAudit };
}
