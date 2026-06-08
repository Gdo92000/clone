import type { MenuItem, Additive, Category, Restaurant } from 'src/domain/entities/Restaurant';
import type { RepositoryPort, RepositoryFilter } from './RepositoryPort';

export type RestaurantFilter = RepositoryFilter<Restaurant> & {
  cuisine?: string;
  city?: string;
  isFeatured?: boolean;
  minRating?: number;
};

export interface IRestaurantRepository extends RepositoryPort<Restaurant, RestaurantFilter> {
  findMenuItems(restaurantId: string): Promise<MenuItem[]>;
  findCategories(): Promise<Category[]>;
  findAdditives(menuItemId: string): Promise<Additive[]>;
  findByCuisine(cuisine: string): Promise<Restaurant[]>;
  findFeatured(): Promise<Restaurant[]>;
}
