import type { Restaurant, MenuItem, Category } from '../types';
import { restaurantApi } from '../api';
import { restaurantListDtoToModel, restaurantDtoToModel, menuItemListDtoToModel, menuItemDtoToModel, categoryDtoToModel } from '../mappers/restaurantMapper';

export async function getRestaurants(page = 1, pageSize = 20): Promise<Restaurant[]> {
  return restaurantApi.getAll().then(restaurantListDtoToModel).then((all) => all.slice(0, page * pageSize));
}

export async function getRestaurantById(id: string): Promise<Restaurant | undefined> {
  return restaurantApi.getById(id).then(restaurantDtoToModel);
}

export async function getMenuItems(restaurantId?: string): Promise<MenuItem[]> {
  return restaurantApi.getMenuItems(restaurantId).then(menuItemListDtoToModel);
}

export async function getMenuItemById(id: string): Promise<MenuItem | undefined> {
  return restaurantApi.getMenuItemById(id).then(menuItemDtoToModel);
}

export async function getCategories(): Promise<Category[]> {
  return restaurantApi.getCategories().then((dtos) => dtos.map(categoryDtoToModel));
}