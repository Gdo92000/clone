import { useActiveCities, useActiveNeighborhoods } from '../../../hooks/useActiveCities';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

export function AdminCoveragePage() {
  const citiesQuery = useActiveCities();

  return (
    <>
      <PageHeader title="Cobertura" />
      <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
        <FxQueryBoundary
          isLoading={citiesQuery.isLoading}
          isError={!!citiesQuery.error}
          error={citiesQuery.error}
          loadingFallback={
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border border-border-default bg-surface-background p-4 h-16" />
              ))}
            </div>
          }
        >
          {citiesQuery.data?.length === 0 ? (
            <p className="text-text-secondary text-center py-8">Nenhuma cidade ativa.</p>
          ) : (
            <div className="space-y-3">
              {citiesQuery.data?.map((city) => (
                <CityCoverageRow key={`${city.city}-${city.state}`} city={city.city} state={city.state} />
              ))}
            </div>
          )}
        </FxQueryBoundary>
      </section>
    </>
  );
}

function CityCoverageRow({ city, state }: { city: string; state: string }) {
  const { data: neighborhoods = [], isLoading } = useActiveNeighborhoods(city, state);
  return (
    <article className="rounded-lg border border-border-default bg-surface-background p-3">
      <header className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-text-primary">{city} - {state}</h3>
        <span className="text-xs text-text-tertiary">{neighborhoods.length} bairros</span>
      </header>
      {isLoading ? (
        <div className="animate-pulse h-4 bg-surface-elevated rounded w-1/2" />
      ) : neighborhoods.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {neighborhoods.map((n) => (
            <span
              key={n.neighborhood}
              className="text-xs px-2 py-1 rounded-full bg-surface-elevated text-text-secondary min-h-[32px] inline-flex items-center"
            >
              {n.neighborhood}
              {n.restaurant_count > 0 && (
                <span className="ml-1.5 text-text-tertiary">({n.restaurant_count})</span>
              )}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary">Nenhum bairro cadastrado</p>
      )}
    </article>
  );
}

export default AdminCoveragePage;
