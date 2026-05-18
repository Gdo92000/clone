import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { supportTickets } from '../experienceData';
import { ExperienceLayout } from '../components/ExperienceLayout';
import { successToast, errorToast } from '../../../lib/toast';

export function SupportPage() {
  const [tickets, setTickets] = usePersistentState('support.tickets', supportTickets);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const createTicket = () => {
    if (!title.trim()) {
      errorToast('Descreva o problema antes de abrir o chamado.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setTickets((current) => [
        { id: `SUP-${Date.now()}`, title: title.trim(), status: 'Aberto', owner: 'Cliente' },
        ...current,
      ]);
      setTitle('');
      setSaving(false);
      successToast('Chamado aberto com sucesso!');
    }, 500);
  };

  return (
    <ExperienceLayout title="Ajuda e suporte">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Novo chamado</h2>
          <label className="mt-4 block">
            <span className="sr-only">Descreva o problema</span>
            <input
              value={title}
              onChange={(event) => { setTitle(event.target.value); }}
              placeholder="Descreva o problema"
              aria-label="Descreva o problema para abrir chamado"
              className="h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
            />
          </label>
          <Button className="mt-3" onClick={createTicket} loading={saving} disabled={saving}>
            {saving ? 'Abrindo...' : 'Abrir chamado'}
          </Button>
        </div>
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="rounded-xl border border-border-default bg-surface-elevated p-8 text-center">
              <p className="text-text-secondary">Nenhum chamado aberto.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
                <p className="font-semibold text-text-primary">{ticket.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{ticket.id} - {ticket.owner} - {ticket.status}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </ExperienceLayout>
  );
}