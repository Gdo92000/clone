import type { Restaurant, MenuItem, Category } from '../types';
import { restaurantApi } from '../api';
import { restaurantListDtoToModel, restaurantDtoToModel, menuItemListDtoToModel, menuItemDtoToModel, categoryDtoToModel } from '../mappers/restaurantMapper';

export async function getRestaurants(page = 1, pageSize = 20): Promise<Restaurant[]> {
  const dtos = await restaurantApi.getAll();
  const all = restaurantListDtoToModel(dtos);
  return all.slice(0, page * pageSize);
}

export async function getRestaurantById(id: string): Promise<Restaurant | undefined> {
  const dto = await restaurantApi.getById(id);
  return restaurantDtoToModel(dto);
}

export async function getMenuItems(restaurantId?: string): Promise<MenuItem[]> {
  const dtos = await restaurantApi.getMenuItems(restaurantId);
  return menuItemListDtoToModel(dtos);
}

export async function getMenuItemById(id: string): Promise<MenuItem | undefined> {
  const dto = await restaurantApi.getMenuItemById(id);
  return menuItemDtoToModel(dto);
}

export async function getCategories(): Promise<Category[]> {
  const dtos = await restaurantApi.getCategories();
  return dtos.map(categoryDtoToModel);
}