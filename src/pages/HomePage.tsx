import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FxImage } from '../components/ui/FxImage';
import { FxNavbar } from '../components/navigation';
import { FxQueryBoundary } from '../components/ui/FxQueryBoundary';
import { FxRestaurantCard } from '../components/commerce/FxRestaurantCard';
import { useLocationContext } from '../context/LocationContext';
import { useRestaurants, useCategories } from '../hooks/useRestaurants';
import { calculateDistance } from '../services/locationService';
import { Icon } from '../components/ui/Icon';
import { ROUTES, restaurantsSearchHref, restaurantsCategoryHref, restaurantDetailHref } from '../lib/routes';
import type { Restaurant } from '../types';

interface RestaurantWithDistance {
  restaurant: Restaurant;
  distanceKm: number;
  isSameNeighborhood: boolean;
}

export function HomePage() {
  const navigate = useNavigate();
  const cartItemCount = 2;
  const { city, coordinates } = useLocationContext();
  const userNeighborhood = city?.neighborhood;
  const [searchQuery, setSearchQuery] = useState('');

  const { data: restaurants = [], isLoading: restaurantsLoading, error: restaurantsError } = useRestaurants();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();

  const cityName = city?.name ?? 'você';

  const filteredAndSortedRestaurants = useMemo<RestaurantWithDistance[]>(() => {
    const cityRestaurants = restaurants.filter(
      (r) => r.city?.toLowerCase() === city?.name.toLowerCase(),
    );

    if (!coordinates || !city) {
      return cityRestaurants.map((r) => ({
        restaurant: r,
        distanceKm: 0,
        isSameNeighborhood: false,
      }));
    }

    const withDistance: RestaurantWithDistance[] = cityRestaurants
      .filter((r) => r.coordinates != null)
      .map((r) => {
        const distanceKm = calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          r.coordinates?.lat ?? 0,
          r.coordinates?.lng ?? 0,
        );
        const isSameNeighborhood =
          userNeighborhood != null &&
          r.neighborhood != null &&
          userNeighborhood.toLowerCase() === r.neighborhood.toLowerCase();

        return { restaurant: r, distanceKm, isSameNeighborhood };
      });

    withDistance.sort((a, b) => {
      if (a.isSameNeighborhood !== b.isSameNeighborhood) {
        return a.isSameNeighborhood ? -1 : 1;
      }
      return a.distanceKm - b.distanceKm;
    });

    return withDistance;
  }, [city, coordinates, userNeighborhood, restaurants]);

  const featured = restaurants.filter((r) => r.isFeatured);

  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      void navigate(restaurantsSearchHref(encodeURIComponent(searchQuery.trim())));
    }
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <FxNavbar onCartClick={() => { void navigate(ROUTES.CART); }} cartItemCount={cartItemCount} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        <FxQueryBoundary isLoading={restaurantsLoading || categoriesLoading} isError={!!restaurantsError || !!categoriesError} error={restaurantsError ?? categoriesError ?? null}>
        <section className="text-center">
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary mt-2">
            Peça sua comida favorita
          </h1>
          <p className="text-text-secondary mt-1 text-sm md:text-base">
            Restaurantes, mercados e conveniência perto de {cityName}
          </p>
          <form onSubmit={handleSearch} className="mt-5 max-w-xl mx-auto relative">
            <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
            <input
               type="text"
               value={searchQuery}
               onChange={(e) => { setSearchQuery(e.target.value); }}
               placeholder="Busque por restaurante ou prato"
               aria-label="Buscar restaurantes"
               className="w-full h-12 pl-12 pr-4 rounded-full bg-surface-elevated border border-border-default text-text-primary placeholder:text-text-tertiary shadow-sm transition-all focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20 focus:shadow-md"
             />
          </form>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Você tem fome do qu??
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((cat) => (
              <button
                key={cat.id}
                onClick={() => { void navigate(restaurantsCategoryHref(cat.slug)); }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-elevated border border-border-default hover:border-brand-primary hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center text-3xl">
                  {cat.icon}
                </span>
                <span className="text-xs font-medium text-text-primary text-center leading-tight">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-text-primary">
                Os melhores restaurantes
              </h2>
              <button
                onClick={() => { void navigate(ROUTES.RESTAURANTS); }}
                className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
              >
                Ver todos
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
              {featured.slice(0, 6).map((r) => (
                <div key={r.id} className="min-w-[280px] sm:min-w-[320px] shrink-0">
                  <FxRestaurantCard
                    restaurant={r}
                    variant="featured"
                    onClick={() => { void navigate(restaurantDetailHref(r.id)); }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
<h2 className="font-display font-bold text-xl text-text-primary">
               Restaurantes em {cityName}
             </h2>
            <span className="text-sm text-text-secondary">
              {filteredAndSortedRestaurants.length} encontrados
            </span>
          </div>
          {filteredAndSortedRestaurants.length === 0 ? (
            <div className="text-center py-12 bg-surface-elevated rounded-2xl border border-border-default">
              <p className="text-text-secondary">
                {city
                  ? `Nenhum restaurante encontrado em ${city.name}`
                  : 'Ative a localização para ver restaurantes perto de você'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedRestaurants.map(({ restaurant, distanceKm }) => (
                <FxRestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  variant={restaurant.rating >= 4.7 ? 'featured' : 'default'}
                  showRealDistance={coordinates != null}
                  distanceKm={distanceKm}
                  onClick={() => { void navigate(restaurantDetailHref(restaurant.id)); }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="relative rounded-2xl overflow-hidden">
          <FxImage
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=250&fit=crop"
            alt="Promoção"
            className="w-full h-36 md:h-44 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-6 md:p-8">
            <div>
              <p className="text-brand-accent text-sm font-semibold uppercase tracking-wider">Cupom exclusivo</p>
              <h3 className="text-white font-display font-bold text-xl md:text-2xl mt-1">Ganhe frete grátis</h3>
              <p className="text-white/70 text-sm mt-1">Na primeira compra com o cupom BEMVINDO</p>
              <button onClick={() => { void navigate(ROUTES.PROMOTIONS); }} className="mt-3 bg-brand-primary text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-brand-primary-hover transition-all active:scale-95">
                Usar cupom
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 border border-border-default p-6 md:p-8 text-center">
          <Icon name="Store" className="mx-auto text-brand-primary" size={40} />
          <h2 className="font-display font-bold text-xl text-text-primary mt-3">
            Quer fazer entregas pelo iFood?
          </h2>
          <p className="text-text-secondary text-sm mt-1 max-w-md mx-auto">
            Cadastre seu restaurante ou mercado e comece a vender em minutos
          </p>
          <button
            onClick={() => { void navigate(ROUTES.MERCHANT_LOGIN); }}
            className="mt-4 bg-brand-primary text-text-inverse font-semibold px-6 py-3 rounded-full hover:bg-brand-primary-hover transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <Icon name="ArrowRight" size={18} />
            Cadastrar agora
          </button>
        </section>
      </FxQueryBoundary>
      </main>
    </div>
  );
}

export default HomePage;