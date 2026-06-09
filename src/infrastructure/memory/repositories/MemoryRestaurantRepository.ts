/* eslint-disable @typescript-eslint/require-await */
import type { IRestaurantRepository, RestaurantFilter } from 'src/domain/repositories/IRestaurantRepository';
import type { MenuItem, Additive, Category, Restaurant } from 'src/domain/entities/Restaurant';
import { mockRestaurants } from '../data/restaurants';
import { mockCategories } from '../data/categories';
import { mockMenuItems } from '../data/menu-items';

export class MemoryRestaurantRepository implements IRestaurantRepository {
  private restaurants = [...mockRestaurants];
  private cats = [...mockCategories];
  private menuItems = [...mockMenuItems];

  async findMany(filter?: RestaurantFilter): Promise<Restaurant[]> {
    let result = this.restaurants;
    if (filter?.cuisine) result = result.filter(r => r.cuisine === filter.cuisine);
    if (filter?.city) result = result.filter(r => r.city === filter.city);
    if (filter?.isFeatured !== undefined) result = result.filter(r => r.isFeatured === filter.isFeatured);
    const minRating = filter?.minRating;
    if (minRating !== undefined) result = result.filter(r => r.rating >= minRating);
    const whereName = filter?.where?.name;
    if (whereName) result = result.filter(r => r.name.includes(whereName));
    return result;
  }

  async findById(id: string): Promise<Restaurant | null> {
    const found = this.restaurants.find(r => r.id === id);
    return found ?? null;
  }

  async findByIds(ids: string[]): Promise<Restaurant[]> {
    return this.restaurants.filter(r => ids.includes(r.id));
  }

  async create(data: Record<string, unknown>): Promise<Restaurant> {
    const item = { id: crypto.randomUUID(), ...data } as unknown as Restaurant;
    this.restaurants.push(item);
    return item;
  }

  async update(id: string, data: Partial<Restaurant>): Promise<Restaurant | null> {
    const found = this.restaurants.find(r => r.id === id);
    if (!found) return null;
    Object.assign(found, data);
    return found;
  }

  async remove(id: string): Promise<boolean> {
    const index = this.restaurants.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.restaurants.splice(index, 1);
    return true;
  }

  async count(): Promise<number> {
    return this.restaurants.length;
  }

  async exists(id: string): Promise<boolean> {
    return this.restaurants.some(r => r.id === id);
  }

  async findMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return this.menuItems.filter(m => m.restaurantId === restaurantId);
  }

  async findCategories(): Promise<Category[]> {
    return this.cats;
  }

  async findAdditives(menuItemId: string): Promise<Additive[]> {
    const item = this.menuItems.find((m) => m.restaurantId === menuItemId || m.id === menuItemId);
    return item?.additives ?? [];
  }

  async findByCuisine(cuisine: string): Promise<Restaurant[]> {
    return this.restaurants.filter(r => r.cuisine === cuisine);
  }

  async findFeatured(): Promise<Restaurant[]> {
    return this.restaurants.filter(r => r.isFeatured);
  }
}
