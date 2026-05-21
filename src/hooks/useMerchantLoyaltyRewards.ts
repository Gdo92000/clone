import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantApi } from '../api/merchantApi';
import { merchantKeys } from '../api/queryKeys';
import type { LoyaltyRewardDTO } from '../dto/superadminDto';
import { successToast, errorToast } from '../lib/toast';

const STALE_MEDIUM = 1000 * 60 * 5;

export function useLoyaltyRewards(branchId: string) {
  return useQuery<LoyaltyRewardDTO[]>({
    queryKey: merchantKeys.loyaltyRewards(branchId),
    queryFn: () => merchantApi.getLoyaltyRewards(branchId),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useSaveLoyaltyReward(editingId: string | null, branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (editingId) {
        return merchantApi.updateLoyaltyReward(editingId, data);
      }
      return merchantApi.createLoyaltyReward({ ...data, branch_id: branchId });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: merchantKeys.loyaltyRewards(branchId) });
      successToast('Recompensa salva com sucesso');
    },
    onError: () => errorToast('Erro ao salvar recompensa'),
  });
}

export function useDeleteLoyaltyReward(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => merchantApi.deleteLoyaltyReward(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: merchantKeys.loyaltyRewards(branchId) });
      successToast('Recompensa removida');
    },
    onError: () => errorToast('Erro ao remover recompensa'),
  });
}
