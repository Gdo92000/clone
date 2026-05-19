import { useQuery } from '@tanstack/react-query';
import { merchantApi } from '../api';
import { orderListDtoToModel } from '../mappers/merchantMapper';

const STALE = 1000 * 60 * 2;

export function useCourierDeliveries() {
  return useQuery({
    queryKey: ['courier', 'deliveries'],
    queryFn: async () => {
      const orders = await merchantApi.getOrders();
      return orderListDtoToModel(orders).filter((o) => o.deliveryType === 'delivery');
    },
    staleTime: STALE,
  });
}

export function useCourierEarnings() {
  return useQuery({
    queryKey: ['courier', 'earnings'],
    queryFn: async () => {
      const orders = await merchantApi.getOrders();
      const deliveries = orderListDtoToModel(orders).filter((o) => o.deliveryType === 'delivery');
      const total = deliveries.reduce((sum, o) => sum + o.total, 0);
      return { deliveries: deliveries.length, totalEarnings: total };
    },
    staleTime: STALE,
  });
}
