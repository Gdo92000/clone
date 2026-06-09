import { useMerchantFinance } from '../../../hooks/useMerchantFinance';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxBarChart } from '../../../components/charts/FxBarChart';
import { formatCurrency } from '../format';

const MONTHS = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function MerchantFinancePage() {
  const now = new Date();
  const { data, isLoading } = useMerchantFinance(now.getFullYear(), now.getMonth() + 1);

  const periodLabel = data ? `${MONTHS[data.period.month - 1] ?? ''}/${data.period.year}` : '';

  const feeData = data
    ? [
        { name: 'Receita bruta', value: data.grossRevenue },
        { name: 'Taxa (12%)', value: -data.platformFee },
        { name: 'Entregas', value: -data.deliveryCost },
        { name: 'Liquido', value: data.netRevenue },
      ]
    : [];

  return (
    <>
      <PageHeader title={`Financeiro - ${periodLabel}`} />
      {isLoading ? (
        <p className="text-sm text-text-secondary">Carregando...</p>
      ) : data ? (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">Faturamento bruto</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(data.grossRevenue)}</p>
            </article>
            <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">Taxa da plataforma</p>
              <p className="mt-2 text-2xl font-bold text-feedback-error">{formatCurrency(data.platformFee)}</p>
            </article>
            <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">Custo de entregas</p>
              <p className="mt-2 text-2xl font-bold text-feedback-error">{formatCurrency(data.deliveryCost)}</p>
            </article>
            <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <p className="text-sm text-text-secondary">Liquido</p>
              <p className="mt-2 text-2xl font-bold text-feedback-success">{formatCurrency(data.netRevenue)}</p>
            </article>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <h2 className="mb-4 font-semibold text-text-primary">Resumo financeiro</h2>
              <FxBarChart data={feeData} dataKey="value" color="#0066ff" height={220} />
            </div>

            <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <h2 className="mb-4 font-semibold text-text-primary">Metodos de pagamento</h2>
              <div className="space-y-2">
                {Object.entries(data.paymentMethods).map(([method, count]) => (
                  <div key={method} className="flex justify-between rounded-lg bg-surface-background p-2 text-sm">
                    <span className="capitalize text-text-primary">{method.replace('_', ' ')}</span>
                    <span className="font-semibold text-text-secondary">{count} pedidos</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
