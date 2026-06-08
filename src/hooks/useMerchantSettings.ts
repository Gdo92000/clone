import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantApi } from '../api/merchantApi';
import { merchantKeys } from '../api/queryKeys';
import type { BranchSettingsDTO } from '../dto/merchantDto';
import type { LoyaltySettingsDTO } from '../dto/superadminDto';
import { successToast, errorToast } from '../lib/toast';

const STALE_MEDIUM = 1000 * 60 * 5;

export function useBranchSettings(branchId: string) {
  return useQuery<BranchSettingsDTO | Record<string, never>>({
    queryKey: merchantKeys.branchSettings(branchId),
    queryFn: () => merchantApi.getSettingsByBranch(branchId),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useLoyaltySettings(branchId: string) {
  return useQuery<LoyaltySettingsDTO>({
    queryKey: merchantKeys.loyaltySettings(branchId),
    queryFn: () => merchantApi.getLoyaltySettings(branchId),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useSaveBranchSettings(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      settings: Partial<BranchSettingsDTO>;
      loyaltySettings?: Record<string, unknown>;
    }) => {
      if (!branchId) return;
      await merchantApi.updateSettings(branchId, data.settings);
      if (data.loyaltySettings) {
        await merchantApi.updateLoyaltySettings(branchId, data.loyaltySettings);
      }
    },
    onSuccess: () => {
      successToast('Configuracoes salvas com sucesso');
      void queryClient.invalidateQueries({ queryKey: merchantKeys.branchSettings(branchId) });
      void queryClient.invalidateQueries({ queryKey: merchantKeys.loyaltySettings(branchId) });
    },
    onError: () => { errorToast('Erro ao salvar configuracoes'); },
  });
}
