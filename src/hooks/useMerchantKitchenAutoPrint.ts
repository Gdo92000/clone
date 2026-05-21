import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../api/superadminApi';
import { merchantApi } from '../api/merchantApi';
import { saasKeys, merchantKeys } from '../api/queryKeys';
import type { AddonDTO , PrintHistoryDTO } from '../dto/superadminDto';
import type { MerchantBranchDTO } from '../dto/merchantDto';
import { successToast, errorToast } from '../lib/toast';

const STALE_MEDIUM = 1000 * 60 * 5;

interface Addon {
  id: string;
  name: string;
  description: string;
  monthly_price: string;
  feature_key: string;
  is_active: boolean;
}

interface SubscriptionAddon {
  subscription_id: string;
  addon_id: string;
  activated_at: string;
}

function mapToAddon(dto: AddonDTO): Addon {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    monthly_price: dto.monthly_price,
    feature_key: dto.category,
    is_active: dto.is_active,
  };
}

function mapToSubscriptionAddon(dto: AddonDTO): SubscriptionAddon {
  return {
    subscription_id: '',
    addon_id: dto.id,
    activated_at: new Date().toISOString(),
  };
}

export function useSaasAddons() {
  return useQuery<Addon[]>({
    queryKey: saasKeys.addons,
    queryFn: () => subscriptionApi.getAddons().then(items => items.map(mapToAddon)),
  });
}

export function useSaasUserAddons() {
  return useQuery<SubscriptionAddon[]>({
    queryKey: saasKeys.userAddons,
    queryFn: () => subscriptionApi.getAddons().then(items => items.map(mapToSubscriptionAddon)),
  });
}

export function useActivateAddon(addonId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!addonId) throw new Error('Addon não encontrado');
      return subscriptionApi.toggleAddon('current', addonId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saasKeys.userAddons });
      successToast('Addon ativado com sucesso!');
    },
    onError: () => { errorToast('Erro ao ativar addon'); },
  });
}

export function usePrintHistoryBranches() {
  return useQuery<MerchantBranchDTO[]>({
    queryKey: merchantKeys.branches,
    queryFn: () => merchantApi.getBranches(),
    staleTime: STALE_MEDIUM,
  });
}

export function usePrintHistoryByBranch(branchId: string) {
  return useQuery<PrintHistoryDTO[]>({
    queryKey: merchantKeys.printHistory(branchId),
    queryFn: () => merchantApi.getPrintHistory(branchId),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}
