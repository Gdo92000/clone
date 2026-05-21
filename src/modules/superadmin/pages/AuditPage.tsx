import { useAuthSession } from '../../auth';
import { useAuditLog } from '../../enterprise';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

export function AuditPage() {
  const { users } = useAuthSession();
  const { events } = useAuditLog();

  return (
    <>      <PageHeader title="Auditoria" />
      <FxQueryBoundary isLoading={false} isError={false}>
      <section className="space-y-3">
        {events.map((event) => {
          const actor = users.find((user) => user.id === event.user_id);
          return (
            <article key={event.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="font-semibold text-text-primary">{event.action}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {actor?.name ?? event.user_id} - {event.details} - {event.created_at}
              </p>
            </article>
          );
        })}
      </section>
      </FxQueryBoundary>
    </>
  );

}

