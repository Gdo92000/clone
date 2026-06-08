import { useRestaurants } from '../../../hooks/useRestaurants';
import { useToggleRestaurantAvailability } from '../../../hooks/useToggleRestaurantAvailability';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';

export function AdminRestaurantsPage() {
  const { data: restaurants = [], isLoading, error } = useRestaurants();
  const toggle = useToggleRestaurantAvailability();

  return (
    <>
      <PageHeader title="Restaurantes" />
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
          {restaurants.length === 0 ? (
            <p className="text-text-secondary text-center py-8">Nenhum restaurante cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {restaurants.map((restaurant) => {
                const isActive = restaurant.isActive;
                const isPending = toggle.isPending && (toggle.variables as { id: string } | undefined)?.id === restaurant.id;
                return (
                  <article
                    key={restaurant.id}
                    className="rounded-lg border border-border-default bg-surface-background p-3"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary">{restaurant.name}</p>
                        <p className="text-sm text-text-secondary truncate">
                          {restaurant.cuisine}
                          {restaurant.neighborhood ? ` — ${restaurant.neighborhood}` : ''}
                          {restaurant.city ? `, ${restaurant.city}` : ''}
                          {restaurant.state ? `/${restaurant.state}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isActive
                              ? 'bg-feedback-success/10 text-feedback-success'
                              : 'bg-feedback-error/10 text-feedback-error'
                          }`}
                        >
                          <Icon name={isActive ? 'CheckCircle' : 'XCircle'} size={12} />
                          {isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        <button
                          type="button"
                          onClick={() => { toggle.mutate({ id: restaurant.id, isActive: !isActive }); }}
                          disabled={isPending}
                          aria-label={isActive ? 'Desativar restaurante' : 'Ativar restaurante'}
                          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                            isActive ? 'bg-brand-primary' : 'bg-surface-inverse'
                          } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${
                              isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </FxQueryBoundary>
      </section>
    </>
  );
}
