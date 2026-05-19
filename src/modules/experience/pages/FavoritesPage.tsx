import { useNavigate } from 'react-router-dom';
import { useRestaurants } from '../../../hooks/useRestaurants';
import { FxRestaurantCard } from '../../../components/commerce/FxRestaurantCard';
import { ExperienceLayout } from '../components/ExperienceLayout';
import { restaurantDetailHref } from '../../../lib/routes';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { data: restaurants = [], isLoading, isError, error } = useRestaurants();
  const favorites = restaurants.slice(0, 3);

  return (
    <ExperienceLayout title="Favoritos e recompra">
      <FxQueryBoundary isLoading={isLoading} isError={isError} error={error}>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {favorites.map((restaurant) => (
            <FxRestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => navigate(restaurantDetailHref(restaurant.id))}
            />
          ))}
        </section>
      </FxQueryBoundary>
    </ExperienceLayout>
  );
}
