import type { IRestaurantRepository } from 'src/domain/repositories/IRestaurantRepository';
import type { Restaurant, MenuItem, Category } from 'src/domain/entities/Restaurant';

export class RestaurantService {
  constructor(private readonly restaurantRepo: IRestaurantRepository) {}

  async listRestaurants(cuisine?: string, city?: string): Promise<Restaurant[]> {
    return this.restaurantRepo.findMany({ ...(cuisine ? { cuisine } : {}), ...(city ? { city } : {}) });
  }

  async getRestaurantDetails(id: string): Promise<Restaurant | null> {
    return this.restaurantRepo.findById(id);
  }

  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    return this.restaurantRepo.findMenuItems(restaurantId);
  }

  async listCategories(): Promise<Category[]> {
    return this.restaurantRepo.findCategories();
  }

  async getFeatured(): Promise<Restaurant[]> {
    return this.restaurantRepo.findFeatured();
  }

  async searchByName(name: string): Promise<Restaurant[]> {
    return this.restaurantRepo.findMany({ where: { name } });
  }
}
