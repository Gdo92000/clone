import { useCoverageCities } from '../../../hooks/useCoverageCities';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { PageHeader } from '../../../components/ui/PageHeader';

export function AdminCoveragePage() {
  const { data: cities = [], isLoading, error } = useCoverageCities();

  return (
    <>
      <PageHeader title="Cidades atendidas" />
      <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
        <FxQueryBoundary
          isLoading={isLoading}
          isError={!!error}
          error={error ?? null}
          loadingFallback={
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border border-border-default bg-surface-background p-3 h-20" />
              ))}
            </div>
          }
        >
          {cities.length === 0 ? (
            <p className="text-text-secondary text-center py-8">Nenhuma cidade cadastrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {cities.map((city) => (
                <article key={city.id} className="rounded-lg border border-border-default bg-surface-background p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{city.name}, {city.state}</p>
                      <p className="text-sm text-text-secondary">
                        {city.restaurant_count} {city.restaurant_count === 1 ? 'restaurante' : 'restaurantes'} — raio de {city.radius_km}km
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${city.is_active ? 'bg-feedback-success/10 text-feedback-success' : 'bg-feedback-error/10 text-feedback-error'}`}>
                      {city.is_active ? 'Ativo' : 'Inativo'}
                    </span>
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
