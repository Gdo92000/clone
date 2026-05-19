import { formatCurrency } from '../../merchant/format';
import { useAdminMetrics } from '../../../hooks/useAdminData';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { PageHeader } from '../../../components/ui/PageHeader';

interface MetricCard {
  label: string;
  value: string;
  detail: string;
}

export function AdminDashboardPage() {
  const { data: metrics, isLoading, error } = useAdminMetrics();
  const cards: MetricCard[] = metrics
    ? [
        { label: 'Empresas', value: String(metrics.companies), detail: 'Contas cadastradas' },
        { label: 'Filiais', value: String(metrics.branches), detail: 'Unidades vinculadas' },
        { label: 'Pedidos hoje', value: String(metrics.ordersToday), detail: 'Fluxo operacional' },
        { label: 'GMV hoje', value: formatCurrency(metrics.grossValue), detail: 'Volume financeiro' },
      ]
    : [];

  return (
    <>
      <PageHeader title="Painel geral" />
      <FxQueryBoundary
        isLoading={isLoading}
        isError={!!error}
        error={error}
        loadingFallback={
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border-default bg-surface-elevated p-4 h-28" />
            ))}
          </section>
        }
      >
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{card.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Fila operacional</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-surface-background p-3">
              <p className="font-medium text-text-primary">Cadastro de empresa</p>
              <p className="text-sm text-text-secondary">Revisao documental e ativacao.</p>
            </div>
            <div className="rounded-lg bg-surface-background p-3">
              <p className="font-medium text-text-primary">Cidade atendida</p>
              <p className="text-sm text-text-secondary">Cidade aparece se houver filial ativa.</p>
            </div>
            <div className="rounded-lg bg-surface-background p-3">
              <p className="font-medium text-text-primary">Auditoria de pedido</p>
              <p className="text-sm text-text-secondary">Base pronta para suporte e reembolso.</p>
            </div>
          </div>
        </section>
      </FxQueryBoundary>
    </>
  );
}
