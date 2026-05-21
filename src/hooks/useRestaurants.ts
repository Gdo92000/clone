import { useQuery } from '@tanstack/react-query';
import { getRestaurants, getRestaurantById, getMenuItems, getMenuItemById, getCategories } from '../repositories/restaurantRepository';
import { restaurantKeys } from '../api/queryKeys';

const STALE_MEDIUM = 1000 * 60 * 5;
const STALE_LONG = 1000 * 60 * 10;

export function useRestaurants() {
  return useQuery({
    queryKey: restaurantKeys.list,
    queryFn: () => getRestaurants(),
    staleTime: STALE_MEDIUM,
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: restaurantKeys.detail(id!),
    queryFn: () => getRestaurantById(id!),
    enabled: !!id,
    staleTime: STALE_MEDIUM,
  });
}

export function useMenuItems(restaurantId: string | undefined) {
  return useQuery({
    queryKey: restaurantKeys.menuItems(restaurantId!),
    queryFn: () => getMenuItems(restaurantId),
    staleTime: STALE_MEDIUM,
  });
}

export function useMenuItem(id: string | undefined) {
  return useQuery({
    queryKey: restaurantKeys.menuItem(id!),
    queryFn: () => getMenuItemById(id!),
    enabled: !!id,
    staleTime: STALE_MEDIUM,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: restaurantKeys.categories,
    queryFn: getCategories,
    staleTime: STALE_LONG,
  });
}
