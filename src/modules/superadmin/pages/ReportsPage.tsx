import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { usePlatformReports } from '../../../hooks/useSuperadminData';


// Removed computeReport as it is no longer used

export function ReportsPage() {
  const { data: report = { totalOrders: 0, totalRevenue: 0, avgTicket: 0, activeStores: 0, deliveryPercent: 0, takeoutPercent: 0 } } = usePlatformReports();

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const metrics = [
    { label: 'Total de pedidos', value: report.totalOrders.toLocaleString('pt-BR'), icon: 'ShoppingBag' },
    { label: 'Receita total', value: formatCurrency(report.totalRevenue), icon: 'DollarSign' },
    { label: 'Ticket médio', value: formatCurrency(report.avgTicket), icon: 'ArrowUpRight' },
    { label: 'Lojas ativas', value: report.activeStores.toLocaleString('pt-BR'), icon: 'Store' },
  ];


  const downloadCSV = () => {
    const rows: string[][] = [
      ['Métrica', 'Valor'],
      ['Total de pedidos', String(report.totalOrders)],
      ['Receita total', String(report.totalRevenue)],
      ['Ticket médio', String(report.avgTicket)],
      ['Delivery %', String(report.deliveryPercent)],
      ['Retirada %', String(report.takeoutPercent)],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <PageHeader title="Relatórios" actions={
        <div className="flex gap-2">
          <Button variant="outline" intent="secondary" size="sm" onClick={downloadCSV}>
            Exportar CSV
          </Button>
          <Button variant="outline" intent="secondary" size="sm" onClick={downloadJSON}>
            Exportar JSON
          </Button>
        </div>
      } />

      <FxQueryBoundary isLoading={false} isError={false}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {metrics.map((m) => (
          <article key={m.label} className="rounded-xl border border-border-default bg-surface-elevated p-4 flex items-center gap-4">
            <span className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Icon name={m.icon} className="text-brand-primary" size={22} />
            </span>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wider">{m.label}</p>
              <p className="text-xl font-bold text-text-primary mt-0.5">{m.value}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border-default bg-surface-elevated p-5">
          <h2 className="font-semibold text-text-primary mb-4">Distribuição de pedidos</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-primary font-medium">Delivery</span>
                <span className="text-text-tertiary">{report.deliveryPercent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-background overflow-hidden">
                <div className="h-full rounded-full bg-brand-primary" style={{ width: `${report.deliveryPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-primary font-medium">Retirada</span>
                <span className="text-text-tertiary">{report.takeoutPercent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-background overflow-hidden">
                <div className="h-full rounded-full bg-brand-secondary" style={{ width: `${report.takeoutPercent}%` }} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border-default bg-surface-elevated p-5">
          <h2 className="font-semibold text-text-primary mb-4">Insights da plataforma</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-background">
              <Icon name="TrendingUp" size={20} className="text-feedback-success" />
              <div>
                <p className="font-medium text-text-primary">Total de pedidos: {report.totalOrders}</p>
                <p className="text-text-tertiary mt-0.5">Pedidos realizados na plataforma</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-background">
              <Icon name="Clock" size={20} className="text-feedback-info" />
              <div>
                <p className="font-medium text-text-primary">Ticket médio: {formatCurrency(report.avgTicket)}</p>
                <p className="text-text-tertiary mt-0.5">Valor médio por pedido</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-background">
              <Icon name="Calendar" size={20} className="text-feedback-warning" />
              <div>
                <p className="font-medium text-text-primary">Receita total: {formatCurrency(report.totalRevenue)}</p>
                <p className="text-text-tertiary mt-0.5">Faturamento acumulado</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-background">
              <Icon name="MapPin" size={20} className="text-brand-primary" />
              <div>
                <p className="font-medium text-text-primary">{report.deliveryPercent}% dos pedidos são delivery</p>
                <p className="text-text-tertiary mt-0.5">{report.takeoutPercent}% optam por retirada</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border-default bg-surface-elevated p-5 mt-6">
        <h2 className="font-semibold text-text-primary mb-4">Exportação de dados</h2>
        <p className="text-sm text-text-secondary mb-4">Baixe os dados completos da plataforma nos formatos disponíveis.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={downloadCSV} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border-default bg-surface-elevated hover:border-brand-primary transition-colors">
            <Icon name="FileSpreadsheet" size={20} className="text-feedback-success" />
            <div className="text-left">
              <p className="font-medium text-text-primary text-sm">CSV</p>
              <p className="text-xs text-text-tertiary">Planilha compatível com Excel</p>
            </div>
          </button>
          <button onClick={downloadJSON} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border-default bg-surface-elevated hover:border-brand-primary transition-colors">
            <Icon name="FileCode" size={20} className="text-feedback-info" />
            <div className="text-left">
              <p className="font-medium text-text-primary text-sm">JSON</p>
              <p className="text-xs text-text-tertiary">Formato estruturado para API</p>
            </div>
          </button>
        </div>
      </section>
      </FxQueryBoundary>
    </>
  );
}

export default ReportsPage;
