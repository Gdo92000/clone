import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantApi } from '../api/merchantApi';
import { merchantKeys } from '../api/queryKeys';
import type { MerchantCouponDTO } from '../dto/superadminDto';
import { successToast, errorToast } from '../lib/toast';

const STALE_MEDIUM = 1000 * 60 * 5;

export function useCouponsByBranch(branchId: string) {
  return useQuery<MerchantCouponDTO[]>({
    queryKey: merchantKeys.couponsByBranch(branchId),
    queryFn: () => merchantApi.getCouponsByBranch(branchId),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useSaveCoupon(editingId: string | null, branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (editingId) return merchantApi.updateCoupon(editingId, data);
      return merchantApi.createCoupon(data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: merchantKeys.couponsByBranch(branchId) });
      successToast('Cupom salvo com sucesso');
    },
    onError: () => errorToast('Erro ao salvar cupom'),
  });
}

export function useToggleCoupon(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      merchantApi.updateCoupon(id, { is_active }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: merchantKeys.couponsByBranch(branchId) });
    },
    onError: () => errorToast('Erro ao atualizar status'),
  });
}

export function useDeleteCoupon(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => merchantApi.deleteCoupon(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: merchantKeys.couponsByBranch(branchId) });
      successToast('Cupom removido');
    },
    onError: () => errorToast('Erro ao remover cupom'),
  });
}
