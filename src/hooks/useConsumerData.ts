import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consumerApi } from '../api/consumerApi';
import { consumerKeys } from '../api/queryKeys';
import { errorToast, successToast } from '../lib/toast';
import type { ConsumerNotificationDTO, ConsumerOrderDTO, ConsumerLoyaltyDTO, SupportTicketDTO, ReviewDTO } from '../dto/superadminDto';

const STALE = 1000 * 60 * 5;

export function useConsumerLoyalty(branchId: string) {
  return useQuery<ConsumerLoyaltyDTO>({
    queryKey: consumerKeys.loyalty(branchId),
    queryFn: () => consumerApi.getMyLoyalty(branchId),
    enabled: !!branchId,
    staleTime: STALE,
  });
}

export function useRedeemLoyaltyReward(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rewardId: string) => consumerApi.redeemLoyaltyReward({ rewardId, branchId }),
    onSuccess: () => {
      successToast('Recompensa resgatada com sucesso!');
      void queryClient.invalidateQueries({ queryKey: consumerKeys.loyalty(branchId) });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Erro ao resgatar recompensa';
      errorToast(message);
    },
  });
}

export function useConsumerOrders() {
  return useQuery<ConsumerOrderDTO[]>({
    queryKey: consumerKeys.orders,
    queryFn: () => consumerApi.getMyOrders(),
    staleTime: STALE,
  });
}

export function useConsumerNotifications() {
  return useQuery<ConsumerNotificationDTO[]>({
    queryKey: consumerKeys.notifications,
    queryFn: () => consumerApi.getMyNotifications(),
    staleTime: 60 * 1000,
  });
}

export function useConsumerTickets() {
  return useQuery<SupportTicketDTO[]>({
    queryKey: consumerKeys.tickets,
    queryFn: () => consumerApi.getMyTickets(),
    staleTime: STALE,
  });
}

export function useConsumerReviews() {
  return useQuery<ReviewDTO[]>({
    queryKey: consumerKeys.reviews,
    queryFn: () => consumerApi.getMyReviews(),
    staleTime: STALE,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subject: string) => consumerApi.createTicket({ subject }),
    onSuccess: () => {
      successToast('Chamado aberto com sucesso!');
      void queryClient.invalidateQueries({ queryKey: consumerKeys.tickets });
    },
    onError: (err: unknown) => {
      errorToast(err instanceof Error ? err.message : 'Erro ao abrir chamado');
    },
  });
}
