import { useAdminCompanies } from '../../../hooks/useAdminData';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { PageHeader } from '../../../components/ui/PageHeader';

export function AdminCompaniesPage() {
  const { data: companies = [], isLoading, error } = useAdminCompanies();

  return (
    <>
      <PageHeader title="Empresas" />
      <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
        <FxQueryBoundary
          isLoading={isLoading}
          isError={!!error}
          error={error}
          loadingFallback={
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border border-border-default bg-surface-background p-3 h-16" />
              ))}
            </div>
          }
        >
          {companies.length === 0 ? (
            <p className="text-text-secondary text-center py-8">Nenhuma empresa cadastrada.</p>
          ) : (
            <div className="space-y-3">
              {companies.map((company) => (
                <article key={company.id} className="rounded-lg border border-border-default bg-surface-background p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{company.name}</p>
                      <p className="text-sm text-text-secondary">{company.document}</p>
                    </div>
                    <div className="text-sm text-text-secondary md:text-right">
                      <p>{(company as { branches?: number }).branches ?? 0} filiais</p>
                      <p>Plano {company.plan}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </FxQueryBoundary>
      </section>
    </>
  );
}
