import { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { useMassNotifications } from '../../../hooks/useSuperadminData';
import { clsx } from 'clsx';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

const targetLabels: Record<string, string> = {
  all: 'Todos os lojistas',
  active: 'Lojistas ativos',
  inactive: 'Lojistas inativos',
  plan: 'Por plano',
};

export function NotificationsPage() {
  const [tab, setTab] = useState<'history' | 'new'>('history');
  const { data: massNotifications = [], isLoading, error } = useMassNotifications();

  return (
    <>
      <PageHeader title="Notificações em massa" />

      <FxQueryBoundary isLoading={isLoading} isError={!!error} error={error instanceof Error ? error : null}>
      <div className="flex gap-1 mb-4 bg-surface-elevated rounded-lg p-1 border border-border-default w-fit">
        <button onClick={() => { setTab('history'); }} className={clsx('px-4 py-2 rounded-md text-sm font-medium transition-colors', tab === 'history' ? 'bg-brand-primary text-text-inverse' : 'text-text-secondary hover:text-text-primary')}>Histórico</button>
        <button onClick={() => { setTab('new'); }} className={clsx('px-4 py-2 rounded-md text-sm font-medium transition-colors', tab === 'new' ? 'bg-brand-primary text-text-inverse' : 'text-text-secondary hover:text-text-primary')}>Nova notificação</button>
      </div>

      {tab === 'history' ? <NotificationHistory notifications={massNotifications} /> : <NewNotification />}
      </FxQueryBoundary>
    </>
  );
}

function NotificationHistory({ notifications }: { notifications: { id: string; title: string; message: string; target: string; sentAt: string; sentBy: string; deliveredCount: number; readCount: number }[] }) {
  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <article key={n.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                <Icon name="Megaphone" size={20} className="text-brand-primary" />
              </span>
              <div>
                <h3 className="font-semibold text-text-primary">{n.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{n.message}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
                  <span>{targetLabels[n.target] ?? n.target}</span>
                  <span>{new Date(n.sentAt).toLocaleDateString('pt-BR')}</span>
                  <span>{n.sentBy}</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-medium text-text-primary">{n.deliveredCount} enviados</p>
              <p className="text-xs text-text-tertiary">{n.readCount} lidos ({Math.round((n.readCount / n.deliveredCount) * 100)}%)</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function NewNotification() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<string>('all');

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    alert('Notificação enviada com sucesso!');
    setTitle('');
    setMessage('');
  };

  return (
    <div className="max-w-xl rounded-xl border border-border-default bg-surface-elevated p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Título</label>
        <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); }}
          placeholder="Ex: Novo horário de funcionamento"
          className="w-full h-11 px-4 rounded-xl bg-surface-background border border-border-default text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-border-focus" />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Mensagem</label>
        <textarea value={message} onChange={(e) => { setMessage(e.target.value); }} rows={4}
          placeholder="Digite a mensagem..."
          className="w-full px-4 py-3 rounded-xl bg-surface-background border border-border-default text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-border-focus resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Público-alvo</label>
        <select value={target} onChange={(e) => { setTarget(e.target.value); }}
          className="w-full h-11 px-4 rounded-xl bg-surface-background border border-border-default text-text-primary text-sm focus:outline-none focus:border-border-focus">
          <option value="all">Todos os lojistas</option>
          <option value="active">Lojistas ativos</option>
          <option value="inactive">Lojistas inativos</option>
        </select>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Button variant="solid" intent="primary" onClick={handleSend}
          disabled={!title.trim() || !message.trim()}>
          Enviar notificação
        </Button>
        <span className="text-xs text-text-tertiary">
          ~{target === 'all' ? '156' : target === 'active' ? '134' : '22'} lojistas receberão
        </span>
      </div>
    </div>
  );
}

export default NotificationsPage;