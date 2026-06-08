import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FxNavbar } from '../components/navigation';
import { FxQueryBoundary } from '../components/ui/FxQueryBoundary';
import { Icon } from '../components/ui/Icon';
import { FxRestaurantCard } from '../components/commerce/FxRestaurantCard';
import { useRestaurants, useCategories } from '../hooks/useRestaurants';
import { useNearbyRestaurants } from '../hooks/useNearbyRestaurants';
import { useLocationContext } from '../context/LocationContext';
import { normalizeCityName } from '../services/cityCoverageFallback';
import { ROUTES, restaurantsSearchHref, restaurantDetailHref } from '../lib/routes';
import type { Restaurant } from '../types';


interface RestaurantWithDistance extends Restaurant {
  distanceKm?: number;
}

type SortOption = 'relevance' | 'rating' | 'delivery' | 'distance';
type QuickFilter = 'free' | 'super' | 'fast';

const sortLabels: Record<SortOption, { label: string; icon: string }> = {
  relevance: { label: 'Relevância', icon: 'TrendingUp' },
  rating: { label: 'Melhores avaliações', icon: 'Star' },
  delivery: { label: 'Menor frete', icon: 'Truck' },
  distance: { label: 'Mais perto', icon: 'MapPin' },
};

export function RestaurantListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') ?? '';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [activeFilters, setActiveFilters] = useState<Set<QuickFilter>>(new Set());

  const [showNearbyOnly, setShowNearbyOnly] = useState(false);

  const { restaurants: nearbyRestaurants, hasLocation, isWithinSupportedCity, isLoading: nearbyLoading } = useNearbyRestaurants({
    maxDistanceKm: 15,
    limit: 50,
    includeAllIfNoLocation: false,
  });

  const { city } = useLocationContext();

  const { data: allRestaurants = [], isLoading: restaurantsLoading, error: restaurantsError } = useRestaurants();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();

  const canShowNearby = showNearbyOnly && hasLocation && isWithinSupportedCity;
  const baseRestaurants = canShowNearby ? nearbyRestaurants : allRestaurants;

  const filteredRestaurants = useMemo(() => {
    let result = [...baseRestaurants];

    // Filtra por cidade detectada (exceto quando já filtrando por proximidade)
    if (!canShowNearby && city) {
      result = result.filter(
        (r) => normalizeCityName(r.city ?? '') === normalizeCityName(city.name),
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.cuisine.toLowerCase().includes(query)
      );
    }

if (selectedCategory) {
       const category = categories.find((c) => c.slug === selectedCategory);
       if (category) {
         result = result.filter((r) =>
           normalizeCityName(r.cuisine) === normalizeCityName(category.name)
         );
       }
     }

    if (activeFilters.has('free')) {
      result = result.filter((r) => r.deliveryFee === 0);
    }

    if (activeFilters.has('super')) {
      result = result.filter((r) => r.rating >= 4.7);
    }

        if (activeFilters.has('fast')) {
          result = result.sort((a, b) => {
            const aMin = parseInt(a.deliveryTime) || 99;
            const bMin = parseInt(b.deliveryTime) || 99;
            return aMin - bMin;
          });
        }

  result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'delivery':
          return a.deliveryFee - b.deliveryFee;
        case 'distance':
          if (canShowNearby && (a as RestaurantWithDistance).distanceKm !== undefined && (b as RestaurantWithDistance).distanceKm !== undefined) {
            return ((a as RestaurantWithDistance).distanceKm ?? 0) - ((b as RestaurantWithDistance).distanceKm ?? 0);
          }
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'relevance':
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, selectedCategory, sortBy, baseRestaurants, canShowNearby, activeFilters, city, categories]);

  const toggleFilter = (filter: QuickFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  const handleRestaurantClick = (restaurantId: string) => {
    void navigate(restaurantDetailHref(restaurantId));
  };

  const handleCartClick = () => {
    void navigate(ROUTES.CART);
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <FxNavbar onSearch={(q) => { void navigate(restaurantsSearchHref(q)); }} onCartClick={handleCartClick} />

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <FxQueryBoundary isLoading={restaurantsLoading || categoriesLoading || nearbyLoading} isError={!!restaurantsError || !!categoriesError} error={restaurantsError ?? categoriesError ?? null}>
        {searchQuery && (
          <div className="flex items-center justify-between">
            <p className="text-text-secondary">
              Resultados para <strong className="text-text-primary">&quot;{searchQuery}&quot;</strong>
            </p>
            <button
              onClick={() => { void navigate(ROUTES.RESTAURANTS); }}
              className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover"
            >
              Limpar
            </button>
          </div>
        )}

        <section className="flex items-center gap-2 pb-1 -mx-4 px-4 overflow-x-auto snap-x snap-mandatory scroll-pl-4 scrollbar-hide">
      {(['free', 'super', 'fast'] as QuickFilter[]).map((filter) => {
        const isActive = activeFilters.has(filter);
        return (
          <button
            key={filter}
            onClick={() => { toggleFilter(filter); }}
            className={`shrink-0 flex items-center gap-1.5 px-4 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-all
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-[0.98] ${
              isActive
                ? 'bg-brand-primary text-text-inverse shadow-sm'
                : 'bg-surface-elevated border border-border-default text-text-secondary hover:border-brand-primary hover:text-text-primary'
            }`}
          >
            <Icon
              name={filter === 'free' ? 'Gift' : filter === 'super' ? 'Award' : 'Zap'}
              size={16}
            />
            {filter === 'free' ? 'Entrega Grátis' : filter === 'super' ? 'Super' : 'Turbo'}
          </button>
        );
      })}
        </section>

        <section className="flex gap-2 overflow-x-auto -mx-4 px-4 snap-x snap-mandatory scroll-pl-4 scrollbar-hide pb-1">
          <button
            onClick={() => { setSelectedCategory(null); }}
            className={`shrink-0 px-4 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-[0.98] ${
              !selectedCategory
                ? 'bg-brand-primary text-text-inverse'
                : 'bg-surface-elevated border border-border-default text-text-secondary hover:border-brand-primary'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => { setSelectedCategory(category.slug); }}
              className={`shrink-0 px-4 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5
                focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-[0.98] ${
                selectedCategory === category.slug
                  ? 'bg-brand-primary text-text-inverse'
                  : 'bg-surface-elevated border border-border-default text-text-secondary hover:border-brand-primary'
              }`}
            >
              <span className="text-base">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </section>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-text-secondary">
            {filteredRestaurants.length}{' '}
            {filteredRestaurants.length === 1 ? 'restaurante encontrado' : 'restaurantes encontrados'}
          </p>

          <div className="flex items-center gap-1">
            {(['relevance', 'rating', 'delivery', 'distance'] as SortOption[]).map((option) => (
              <button
                key={option}
                onClick={() => { setSortBy(option); }}
                className={`flex items-center gap-1 px-3 min-h-[44px] rounded-full text-xs font-medium whitespace-nowrap transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-[0.98] ${
                  sortBy === option
                    ? 'bg-surface-background border border-border-default text-text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                <Icon name={sortLabels[option].icon} size={14} />
                {sortBy === option && sortLabels[option].label}
              </button>
            ))}
          </div>
        </div>

        <section>
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12 bg-surface-elevated rounded-2xl border border-border-default">
              <Icon name="SearchX" className="mx-auto text-text-tertiary" size={48} />
              <h3 className="font-semibold text-lg text-text-primary mt-4 mb-1">
                Nenhum restaurante encontrado
              </h3>
              <p className="text-text-secondary text-sm">
                Tente buscar por outro termo ou categoria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRestaurants.map((restaurant) => (
                <FxRestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  variant={restaurant.rating >= 4.7 ? 'featured' : 'default'}
                  onClick={() => { handleRestaurantClick(restaurant.id); }}
                />
              ))}
            </div>
          )}
        </section>

        {hasLocation && isWithinSupportedCity && (
          <section className="flex items-center justify-between bg-surface-elevated border border-border-default rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Icon name="MapPin" size={16} className="text-brand-primary" />
              <span className="text-sm font-medium text-text-primary">Mostrar apenas próximos a mim</span>
              {nearbyLoading && <span className="text-xs text-text-secondary">Detectando...</span>}
            </div>
            <button
              onClick={() => { setShowNearbyOnly(!showNearbyOnly); }}
              disabled={nearbyLoading}
              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                showNearbyOnly ? 'bg-brand-primary' : 'bg-surface-inverse'
              } ${nearbyLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Mostrar restaurantes próximos"
            >
              <span
                className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${
                  showNearbyOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </section>
        )}

        <button
          type="button"
          onClick={() => void navigate(ROUTES.NEARBY)}
          className="w-full rounded-xl border border-border-default bg-surface-elevated p-4 text-left hover:border-brand-primary transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <Icon name="MapPin" size={20} />
            </span>
            <div>
              <h3 className="font-semibold text-text-primary">Buscar estabelecimentos reais perto de mim</h3>
              <p className="text-sm text-text-secondary">Usa OpenStreetMap sem chave de API</p>
            </div>
          </div>
        </button>
      </FxQueryBoundary>
      </main>

    </div>
  );
}

export default RestaurantListPage;