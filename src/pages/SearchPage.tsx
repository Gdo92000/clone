import { useNavigate, useSearchParams } from 'react-router-dom';
import { FxSearchBar } from '../components/commerce/FxSearchBar';
import { FxFilterChips } from '../components/commerce/FxFilterChips';
import { FxRestaurantCard } from '../components/commerce/FxRestaurantCard';
import { FxPageNavbar } from '../components/navigation/FxPageNavbar';
import { FxQueryBoundary } from '../components/ui/FxQueryBoundary';
import { useRestaurantSearch } from '../hooks/useRestaurantFilter';
import { restaurantDetailHref } from '../lib/routes';


export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') ?? '';
  const { setQuery, selectedCategory, setSelectedCategory, selectedSort, setSelectedSort, filteredRestaurants, sortOptions, categories, loading } = useRestaurantSearch({ initialQuery });

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleRestaurantClick = (restaurantId: string) => {
    void navigate(restaurantDetailHref(restaurantId));
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <FxPageNavbar title="Buscar" />

      <main>
        <FxQueryBoundary isLoading={loading} isError={false} error={null}>
        <div className="fx-container py-4 space-y-4">
          <FxSearchBar
            initialValue={initialQuery}
            onSearch={handleSearch}
          />

          <div className="space-y-2">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
              Categorias
            </p>
            <FxFilterChips
              options={categories.map((c) => ({ id: c.slug, label: c.name }))}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
              Ordenar por
            </p>
            <FxFilterChips
              options={sortOptions}
              selected={selectedSort}
              onSelect={setSelectedSort}
            />
          </div>

          <div className="pt-4">
            <p className="text-sm text-text-secondary mb-3">
              {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurante' : 'restaurantes'} encontrado{filteredRestaurants.length !== 1 ? 's' : ''}
            </p>

            {filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRestaurants.map((restaurant) => (
                  <FxRestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={() => { handleRestaurantClick(restaurant.id); }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Nenhum restaurante encontrado
                </h3>
                <p className="text-text-secondary">
                  Tente buscar com outros termos ou filtros
                </p>
              </div>
            )}
          </div>
        </div>
        </FxQueryBoundary>
      </main>
    </div>
  );
}

export default SearchPage;