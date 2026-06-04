import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantApi } from '../api';
import { orderListDtoToModel } from '../mappers/merchantMapper';
import { courierKeys } from '../api/queryKeys';

const STALE = 1000 * 60 * 2;

export function useCourierDeliveries() {
  return useQuery({
    queryKey: courierKeys.deliveries,
    queryFn: async () => {
      const orders = await merchantApi.getOrders();
      return orderListDtoToModel(orders).filter((o) => o.deliveryType === 'delivery');
    },
    staleTime: STALE,
  });
}

export function useUpdateDeliveryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, deliveryStatus }: { orderId: string; deliveryStatus: 'in_route' | 'delivered' }) => {
      const status: 'dispatched' | 'delivered' = deliveryStatus === 'in_route' ? 'dispatched' : 'delivered';
      await merchantApi.updateOrderStatus(orderId, status);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: courierKeys.deliveries });
    },
  });
}


