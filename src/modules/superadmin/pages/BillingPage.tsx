import { useCompanies } from '../../../hooks/useMerchantData';
import { formatCurrency } from '../../merchant/format';
import { useSaasWorkspace } from '../../saas';
import { useAuthSession } from '../../auth';
import { useAuditLog } from '../../enterprise';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

export function BillingPage() {
  const { data: companies = [], isLoading, error } = useCompanies();
  const { invoices, setSubscriptions } = useSaasWorkspace();
  const { currentUser } = useAuthSession();
  const { recordAudit } = useAuditLog();

  const blockCompany = (companyId: string) => {
    setSubscriptions((current) =>
      current.map((subscription) =>
        subscription.companyId === companyId
          ? {
              ...subscription,
              billingStatus: 'blocked',
              blockedReason: 'Inadimplencia simulada pelo billing.',
            }
          : subscription
      )
    );
    recordAudit(currentUser?.id ?? 'system', 'Bloqueou empresa por inadimplencia', companyId);
  };

  return (
    <><PageHeader title="Billing e faturas" />
      <FxQueryBoundary isLoading={isLoading} isError={!!error} error={error}>
      <section className="space-y-3">
        {invoices.map((invoice) => {
          const company = companies.find((item) => item.id === invoice.companyId);

          return (
            <article key={invoice.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-text-primary">{invoice.id} - {company?.name}</p>
                  <p className="text-sm text-text-secondary">
                    Vencimento {invoice.dueDate} - status {invoice.status}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <p className="font-bold text-text-primary">{formatCurrency(invoice.amount)}</p>
                  {invoice.status !== 'paid' && (
                    <button
                      type="button"
                      onClick={() => { blockCompany(invoice.companyId); }}
                      className="rounded-lg bg-feedback-error px-3 py-2 text-sm font-semibold text-text-inverse"
                    >
                      Bloquear por inadimplencia
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
      </FxQueryBoundary>
    </>
  );

}

