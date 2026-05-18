import { notifications } from '../experienceData';
import { ExperienceLayout } from '../components/ExperienceLayout';

export function NotificationsPage() {
  return (
    <ExperienceLayout title="Central de notificacoes">
      <section className="space-y-3">
        {notifications.map((item) => (
          <article key={item.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <p className="font-semibold text-text-primary">{item.title}</p>
            <p className="mt-1 text-sm text-text-secondary">{item.body}</p>
          </article>
        ))}
      </section>
    </ExperienceLayout>
  );
}
