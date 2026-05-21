import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/superadminApi';
import { superadminKeys } from '../../api/queryKeys';

export function useAuditLog() {
  const { data: events = [] } = useQuery({
    queryKey: superadminKeys.auditEvents,
    queryFn: () => auditApi.list(),
  });

  const recordAudit = (..._args: unknown[]) => {};

  return { events, recordAudit };
}
