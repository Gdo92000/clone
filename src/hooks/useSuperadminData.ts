import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  globalCouponApi,
  notificationsApi,
  auditApi,
  merchantApi,
  subscriptionApi,
  commissionPlanApi,
  reportsApi,
} from '../api';

const STALE = 1000 * 60 * 5;

export function useGlobalCoupons() {
  return useQuery<any[]>({
    queryKey: ['global-coupons'],
    queryFn: () => globalCouponApi.list(),
    staleTime: STALE,
  });
}

export function useMassNotifications() {
  return useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    staleTime: STALE,
  });
}

export function useAuditEvents() {
  return useQuery<any[]>({
    queryKey: ['audit-events'],
    queryFn: () => auditApi.list(),
    staleTime: STALE,
  });
}

export function usePlatformMetrics() {
  return useQuery({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      const [companies, subscriptions] = await Promise.all([
        merchantApi.getCompanies().catch(() => []),
        subscriptionApi.getSubscriptions().catch(() => []),
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
  return useQuery<any[]>({
    queryKey: ['commission-plans'],
    queryFn: () => commissionPlanApi.list(),
    staleTime: STALE,
  });
}

export function useUpdateCommissionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => commissionPlanApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-plans'] });
    },
  });
}

export function usePlatformReports() {
  return useQuery({
    queryKey: ['platform-reports'],
    queryFn: () => reportsApi.getPlatformMetrics(),
    staleTime: STALE,
  });
}
