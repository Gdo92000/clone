import type { Restaurant, MenuItem, Category } from '@/types/restaurant';

export interface IRestaurantProvider {
	getAll(): Promise<Restaurant[]>;
	getById(id: string): Promise<Restaurant | undefined>;
	getMenuItems(restaurantId?: string): Promise<MenuItem[]>;
	getMenuItemById(id: string): Promise<MenuItem | undefined>;
	getCategories(): Promise<Category[]>;
	readonly name: string;
}
