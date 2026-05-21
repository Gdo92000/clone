import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCompanies,
  getBranches,
  getBranchesByCompany,
  getMenuItems as getMerchantMenuItems,
  getMenuItemsByBranch,
  getOrders,
  getOrdersByBranch,
  updateOrderStatus,
  getCoupons,
} from '../repositories/merchantRepository';
import type { MerchantOrderStatus } from '../types';
import { merchantKeys } from '../api/queryKeys';
import { logger } from '../lib/logger';

const STALE_MEDIUM = 1000 * 60 * 5;

export function useCompanies() {
  return useQuery({ queryKey: merchantKeys.companies, queryFn: getCompanies, staleTime: STALE_MEDIUM });
}

export function useBranches() {
  return useQuery({ queryKey: merchantKeys.branches, queryFn: getBranches, staleTime: STALE_MEDIUM });
}

export function useBranchesByCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: merchantKeys.branchesByCompany(companyId ?? ''),
    queryFn: () => getBranchesByCompany(companyId ?? ''),
    enabled: !!companyId,
    staleTime: STALE_MEDIUM,
  });
}

export function useMenuItems() {
  return useQuery({ queryKey: merchantKeys.menuItems, queryFn: getMerchantMenuItems, staleTime: STALE_MEDIUM });
}

export function useMenuItemsByBranch(branchId: string | undefined) {
  return useQuery({
    queryKey: merchantKeys.menuItemsByBranch(branchId ?? ''),
    queryFn: () => getMenuItemsByBranch(branchId ?? ''),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useOrders() {
  return useQuery({ queryKey: merchantKeys.orders, queryFn: getOrders, staleTime: STALE_MEDIUM });
}

export function useOrdersByBranch(branchId: string | undefined) {
  return useQuery({
    queryKey: merchantKeys.ordersByBranch(branchId ?? ''),
    queryFn: () => getOrdersByBranch(branchId ?? ''),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: MerchantOrderStatus }) => {
      await updateOrderStatus(orderId, status);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: merchantKeys.orders });
    },
  onError: (error) => {
    logger.error('Merchant', 'Failed to update order status', error);
  },
  });
}

export function useCoupons() {
  return useQuery({ queryKey: merchantKeys.coupons, queryFn: getCoupons, staleTime: STALE_MEDIUM });
}

export function useCampaigns() {
  return useQuery({ queryKey: merchantKeys.campaigns, queryFn: () => import('../api').then((m) => m.merchantApi.getCampaigns()), staleTime: STALE_MEDIUM });
}