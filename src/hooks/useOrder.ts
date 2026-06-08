import { useQuery } from '@tanstack/react-query';
import { consumerApi, type OrderDetailResponse } from '../api/consumerApi';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: () => [...orderKeys.lists()] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export function useOrder(orderId: string | undefined, options?: { refetchInterval?: number }) {
  return useQuery<OrderDetailResponse>({
    queryKey: orderKeys.detail(orderId ?? ''),
    queryFn: () => {
      if (!orderId) throw new Error('orderId required');
      return consumerApi.getOrder(orderId);
    },
    enabled: Boolean(orderId),
    ...(options?.refetchInterval !== undefined ? { refetchInterval: options.refetchInterval } : {}),
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: () => consumerApi.getMyOrders(),
  });
}
