import { get } from './httpClient';
import type { RestaurantDTO, MenuItemDTO, CategoryDTO } from '../dto/restaurantDto';

export const restaurantApi = {
  getAll: () => get<RestaurantDTO[]>('/restaurants'),
  getById: (id: string) => get<RestaurantDTO>(`/restaurants/${id}`),
  getMenuItems: (restaurantId?: string) =>
    get<MenuItemDTO[]>(restaurantId ? `/restaurants/${restaurantId}/menu-items` : '/menu-items'),
  getMenuItemById: (id: string) => get<MenuItemDTO>(`/menu-items/${id}`),
  getCategories: () => get<CategoryDTO[]>('/categories'),
};