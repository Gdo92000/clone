import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi, type InviteTeamMemberDTO, type UpdateTeamMemberDTO } from '../api/teamApi';
import { teamKeys } from '../api/queryKeys';
import { successToast, errorToast } from '../lib/toast';

export function useTeam() {
  return useQuery({
    queryKey: teamKeys.list,
    queryFn: () => teamApi.list(),
  });
}

export function useTeamMember(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamApi.get(id),
    enabled: !!id,
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: InviteTeamMemberDTO) => teamApi.invite(input),
    onSuccess: () => {
      successToast('Convite enviado com sucesso');
      void queryClient.invalidateQueries({ queryKey: teamKeys.list });
    },
    onError: (err: unknown) => {
      errorToast(err instanceof Error ? err.message : 'Erro ao convitar usuário');
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTeamMemberDTO }) => teamApi.update(id, data),
    onSuccess: () => {
      successToast('Usuário atualizado');
      void queryClient.invalidateQueries({ queryKey: teamKeys.list });
    },
    onError: (err: unknown) => {
      errorToast(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    },
  });
}

export function useDeactivateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => teamApi.deactivate(id),
    onSuccess: () => {
      successToast('Usuário desativado');
      void queryClient.invalidateQueries({ queryKey: teamKeys.list });
    },
    onError: (err: unknown) => {
      errorToast(err instanceof Error ? err.message : 'Erro ao desativar usuário');
    },
  });
}

export function useReactivateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => teamApi.reactivate(id),
    onSuccess: () => {
      successToast('Usuário reativado');
      void queryClient.invalidateQueries({ queryKey: teamKeys.list });
    },
    onError: (err: unknown) => {
      errorToast(err instanceof Error ? err.message : 'Erro ao reativar usuário');
    },
  });
}
