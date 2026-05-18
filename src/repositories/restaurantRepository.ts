import type { Restaurant, MenuItem, Category } from '../types';
import { restaurants as mockRestaurants, menuItems as mockMenuItems, categories as mockCategories } from '../data/restaurants';
import { restaurantApi } from '../api';
import { restaurantListDtoToModel, restaurantDtoToModel, menuItemListDtoToModel, menuItemDtoToModel, categoryDtoToModel } from '../mappers/restaurantMapper';

const useMock = __USE_MOCK__;

export async function getRestaurants(page = 1, pageSize = 20): Promise<Restaurant[]> {
  if (useMock) return mockRestaurants.slice(0, page * pageSize);
  return restaurantApi.getAll().then(restaurantListDtoToModel).then((all) => all.slice(0, page * pageSize));
}

export async function getRestaurantById(id: string): Promise<Restaurant | undefined> {
  if (useMock) return mockRestaurants.find((r) => r.id === id);
  return restaurantApi.getById(id).then(restaurantDtoToModel);
}

export async function getMenuItems(restaurantId?: string): Promise<MenuItem[]> {
  if (useMock) return restaurantId ? mockMenuItems.filter((i) => i.restaurantId === restaurantId) : mockMenuItems;
  return restaurantApi.getMenuItems(restaurantId).then(menuItemListDtoToModel);
}

export async function getMenuItemById(id: string): Promise<MenuItem | undefined> {
  if (useMock) return mockMenuItems.find((i) => i.id === id);
  return restaurantApi.getMenuItemById(id).then(menuItemDtoToModel);
}

export async function getCategories(): Promise<Category[]> {
  return useMock ? mockCategories : restaurantApi.getCategories().then((dtos) => dtos.map(categoryDtoToModel));
}