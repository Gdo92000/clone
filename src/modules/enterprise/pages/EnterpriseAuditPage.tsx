import { PageHeader } from '../../../components/ui/PageHeader';
import { useAuditLog } from '../useAuditLog';

export function EnterpriseAuditPage() {
  const { events } = useAuditLog();

  return (
    <>
      <PageHeader title="Auditoria Corporativa" />
      <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
        {events.length === 0 ? (
          <p className="text-sm text-text-secondary">Nenhum evento de auditoria registrado.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-default text-text-secondary">
                <th className="pb-2 font-medium">Ação</th>
                <th className="pb-2 font-medium">Detalhes</th>
                <th className="pb-2 font-medium">Usuário</th>
                <th className="pb-2 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border-default last:border-0">
                  <td className="py-2 text-text-primary">{event.action}</td>
                  <td className="py-2 text-text-secondary">{event.details}</td>
                  <td className="py-2 text-text-secondary">{event.user_id}</td>
                  <td className="py-2 text-text-secondary">
                    {new Date(event.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
