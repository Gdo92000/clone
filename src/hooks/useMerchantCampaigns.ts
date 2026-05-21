import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantApi } from '../api/merchantApi';
import { merchantKeys } from '../api/queryKeys';
import type { CampaignDTO } from '../dto/superadminDto';
import { successToast, errorToast } from '../lib/toast';

const STALE_MEDIUM = 1000 * 60 * 5;

export function useCampaigns() {
  return useQuery<CampaignDTO[]>({
    queryKey: merchantKeys.campaigns,
    queryFn: () => merchantApi.getCampaigns(),
    staleTime: STALE_MEDIUM,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => merchantApi.createCampaign(data),
    onSuccess: () => {
      successToast('Campanha criada com sucesso!');
      void queryClient.invalidateQueries({ queryKey: merchantKeys.campaigns });
    },
    onError: (err) => errorToast(err instanceof Error ? err.message : 'Erro ao criar campanha'),
  });
}
