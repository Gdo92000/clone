import { useConsumerNotifications } from '../../../hooks/useConsumerData';
import type { ConsumerNotificationDTO } from '../../../dto/superadminDto';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { ExperienceLayout } from '../components/ExperienceLayout';

export function NotificationsPage() {
  const { data: notifications = [], isLoading } = useConsumerNotifications();

  return (
    <ExperienceLayout title="Central de notificacoes">
      <FxQueryBoundary isLoading={isLoading} isError={false}>
        <section className="space-y-3">
          {notifications.length === 0 ? (
            <div className="rounded-xl border border-border-default bg-surface-elevated p-8 text-center">
              <p className="text-text-primary font-semibold">Nenhuma notificação</p>
              <p className="mt-2 text-sm text-text-secondary">Em breve você receberá notificações aqui</p>
            </div>
          ) : (
            notifications.map((item: ConsumerNotificationDTO) => (
              <article key={item.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
                <p className="font-semibold text-text-primary">{item.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{item.body}</p>
              </article>
            ))
          )}
        </section>
      </FxQueryBoundary>
    </ExperienceLayout>
  );
}
