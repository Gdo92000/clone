import { useQuery } from '@tanstack/react-query';
import {
  globalCouponApi,
  notificationsApi,
  auditApi,
  merchantApi,
  subscriptionApi,
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
