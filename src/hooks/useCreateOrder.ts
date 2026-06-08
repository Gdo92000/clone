import { useMutation, useQueryClient } from '@tanstack/react-query';
import { consumerApi, type CreateOrderInput, type CreateOrderResponse } from '../api/consumerApi';
import { orderKeys } from './useOrder';

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation<CreateOrderResponse, Error, CreateOrderInput>({
    mutationFn: async (input) => consumerApi.createOrder(input),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.all });
      await queryClient
        .prefetchQuery({
          queryKey: orderKeys.detail(data.id),
          queryFn: () => consumerApi.getOrder(data.id),
        })
        .catch(() => undefined);
    },
  });
}
