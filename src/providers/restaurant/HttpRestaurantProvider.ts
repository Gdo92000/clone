import type { Restaurant, MenuItem, Category } from '@/types/restaurant';
import type { IRestaurantProvider } from './IRestaurantProvider';
import { restaurantApi } from '@/api/restaurantApi';
import { restaurantListDtoToModel, restaurantDtoToModel, menuItemListDtoToModel, menuItemDtoToModel, categoryDtoToModel } from '@/mappers/restaurantMapper';

export class HttpRestaurantProvider implements IRestaurantProvider {
	name = 'http';

	async getAll(): Promise<Restaurant[]> {
		const dtos = await restaurantApi.getAll();
		return restaurantListDtoToModel(dtos);
	}

	async getById(id: string): Promise<Restaurant | undefined> {
		const dto = await restaurantApi.getById(id);
		return restaurantDtoToModel(dto);
	}

	async getMenuItems(restaurantId?: string): Promise<MenuItem[]> {
		const dtos = await restaurantApi.getMenuItems(restaurantId);
		return menuItemListDtoToModel(dtos);
	}

	async getMenuItemById(id: string): Promise<MenuItem | undefined> {
		const dto = await restaurantApi.getMenuItemById(id);
		return menuItemDtoToModel(dto);
	}

	async getCategories(): Promise<Category[]> {
		const dtos = await restaurantApi.getCategories();
		return dtos.map(categoryDtoToModel);
	}
}
