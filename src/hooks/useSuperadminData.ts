import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  globalCouponApi,
  notificationsApi,
  auditApi,
  merchantApi,
  superadminSubscriptionApi,
  commissionPlanApi,
  reportsApi,
  superadminApi,
} from '../api';
import { superadminKeys, saasKeys } from '../api/queryKeys';
import { errorToast, infoToast, successToast } from '../lib/toast';
import { logger } from '../lib/logger';
import type { CreateGlobalCouponInput } from '../dto/superadminDto';

const STALE = 1000 * 60 * 5;
const STALE_LONG = 1000 * 60 * 10;

export function useGlobalCoupons() {
  return useQuery({
    queryKey: superadminKeys.globalCoupons,
    queryFn: () => globalCouponApi.list(),
    staleTime: STALE,
  });
}

export function useSaveGlobalCoupon(editingId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGlobalCouponInput) =>
      editingId ? globalCouponApi.update(editingId, data) : globalCouponApi.create(data),
    onSuccess: () => {
      successToast(editingId ? 'Cupom atualizado com sucesso!' : 'Cupom criado com sucesso!');
      void queryClient.invalidateQueries({ queryKey: superadminKeys.globalCoupons });
    },
    onError: (err: unknown) => { errorToast(err instanceof Error ? err.message : 'Erro ao salvar'); },
  });
}

export function useDeleteGlobalCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => globalCouponApi.delete(id),
    onSuccess: () => {
      infoToast('Cupom removido.');
      void queryClient.invalidateQueries({ queryKey: superadminKeys.globalCoupons });
    },
    onError: (err: unknown) => { errorToast(err instanceof Error ? err.message : 'Erro ao remover'); },
  });
}

export function useToggleGlobalCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; data: Partial<CreateGlobalCouponInput> }) =>
      globalCouponApi.update(params.id, params.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: superadminKeys.globalCoupons });
    },
    onError: (err: unknown) => { errorToast(err instanceof Error ? err.message : 'Erro ao alternar'); },
  });
}

export function useMassNotifications() {
  return useQuery({
    queryKey: superadminKeys.notifications,
    queryFn: () => notificationsApi.list(),
    staleTime: STALE,
  });
}

export function useAuditEvents() {
  return useQuery({
    queryKey: superadminKeys.auditEvents,
    queryFn: () => auditApi.list(),
    staleTime: STALE,
  });
}

export function usePlatformMetrics() {
  return useQuery({
    queryKey: superadminKeys.platformMetrics,
    queryFn: async () => {
      const [companies, subscriptions] = await Promise.all([
        merchantApi.getCompanies().catch((err: unknown) => { logger.error('Superadmin', 'Failed to fetch companies', err); return [] as unknown[]; }),
        superadminSubscriptionApi.getSubscriptions().catch((err: unknown) => { logger.error('Superadmin', 'Failed to fetch subscriptions', err); return [] as unknown[]; }),
      ]);
      return {
        totalCompanies: Array.isArray(companies) ? companies.length : 0,
        totalSubscriptions: Array.isArray(subscriptions) ? subscriptions.length : 0,
      };
    },
    staleTime: STALE,
  });
}

export function useCommissionPlans() {
  return useQuery({
    queryKey: superadminKeys.commissionPlans,
    queryFn: () => commissionPlanApi.list(),
    staleTime: STALE,
  });
}

export function useUpdateCommissionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      commissionPlanApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: superadminKeys.commissionPlans });
    },
  });
}

export function usePlatformReports() {
  return useQuery({
    queryKey: superadminKeys.platformReports,
    queryFn: () => reportsApi.getPlatformMetrics(),
    staleTime: STALE,
  });
}

export function useSaasSubscriptions() {
  return useQuery({
    queryKey: saasKeys.subscriptions,
    queryFn: () => superadminSubscriptionApi.getSubscriptions(),
    staleTime: STALE_LONG,
  });
}

export function useSaasAddonsList() {
  return useQuery({
    queryKey: saasKeys.addons,
    queryFn: () => superadminSubscriptionApi.getAddons(),
    staleTime: STALE_LONG,
  });
}

export function useSaasPlansList() {
  return useQuery({
    queryKey: saasKeys.plans,
    queryFn: () => superadminSubscriptionApi.getPlans(),
    staleTime: STALE_LONG,
  });
}

export function useUpdateSubscriptionPlan(onRecordAudit: (userId: string, action: string, detail: string) => void, currentUserId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, planId }: { companyId: string; planId: string }) =>
      superadminSubscriptionApi.updateSubscription(companyId, { plan_id: planId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saasKeys.subscriptions });
      onRecordAudit(currentUserId ?? 'system', 'Alterou plano', 'Updated via API');
      successToast('Plano atualizado');
    },
    onError: () => { errorToast('Erro ao atualizar plano'); },
  });
}

export function useUpdateSubscriptionStatus(onRecordAudit: (userId: string, action: string, detail: string) => void, currentUserId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, billingStatus }: { companyId: string; billingStatus: string }) =>
      superadminSubscriptionApi.updateSubscription(companyId, { billing_status: billingStatus }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saasKeys.subscriptions });
      onRecordAudit(currentUserId ?? 'system', 'Alterou status financeiro', 'Updated via API');
      successToast('Status atualizado');
    },
    onError: () => { errorToast('Erro ao atualizar status'); },
  });
}

export function useToggleSubscriptionAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, addonId }: { subscriptionId: string; addonId: string }) =>
      superadminSubscriptionApi.toggleAddon(subscriptionId, addonId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saasKeys.subscriptions });
      successToast('Addon atualizado');
    },
    onError: () => { errorToast('Erro ao alterar addon'); },
  });
}

export function useAllPermissions() {
  return useQuery({
    queryKey: superadminKeys.permissionsAll,
    queryFn: () => superadminApi.permissionApi.list(),
    staleTime: STALE_LONG,
  });
}

export function useRolePermissions(role: string) {
  return useQuery({
    queryKey: superadminKeys.permissionsByRole(role),
    queryFn: () => superadminApi.permissionApi.getByRole(role),
    enabled: !!role,
    staleTime: STALE_LONG,
  });
}

export function useAssignPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { role: string; permissionId: string }) => superadminApi.permissionApi.assign(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: superadminKeys.permissionsByRole(variables.role) });
      successToast('Permissão atribuída');
    },
    onError: () => { errorToast('Erro ao atribuir permissão'); },
  });
}

export function useRevokePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { role: string; permissionId: string }) => superadminApi.permissionApi.revoke(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: superadminKeys.permissionsByRole(variables.role) });
      successToast('Permissão revogada');
    },
    onError: () => { errorToast('Erro ao revogar permissão'); },
  });
}
