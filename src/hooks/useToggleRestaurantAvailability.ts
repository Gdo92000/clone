import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantAvailabilityApi } from '../api/restaurantAvailabilityApi';
import { citiesKeys, restaurantKeys } from '../api/queryKeys';

export function useToggleRestaurantAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      restaurantAvailabilityApi.setAvailability(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
      void queryClient.invalidateQueries({ queryKey: citiesKeys.all });
    },
  });
}
