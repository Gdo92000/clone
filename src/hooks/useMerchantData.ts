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

const STALE_MEDIUM = 1000 * 60 * 5;

export function useCompanies() {
  return useQuery({ queryKey: ['merchant', 'companies'], queryFn: getCompanies, staleTime: STALE_MEDIUM });
}

export function useBranches() {
  return useQuery({ queryKey: ['merchant', 'branches'], queryFn: getBranches, staleTime: STALE_MEDIUM });
}

export function useBranchesByCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: ['merchant', 'branches', companyId],
    queryFn: () => getBranchesByCompany(companyId!),
    enabled: !!companyId,
    staleTime: STALE_MEDIUM,
  });
}

export function useMenuItems() {
  return useQuery({ queryKey: ['merchant', 'menuItems'], queryFn: getMerchantMenuItems, staleTime: STALE_MEDIUM });
}

export function useMenuItemsByBranch(branchId: string | undefined) {
  return useQuery({
    queryKey: ['merchant', 'menuItems', branchId],
    queryFn: () => getMenuItemsByBranch(branchId!),
    enabled: !!branchId,
    staleTime: STALE_MEDIUM,
  });
}

export function useOrders() {
  return useQuery({ queryKey: ['merchant', 'orders'], queryFn: getOrders, staleTime: STALE_MEDIUM });
}

export function useOrdersByBranch(branchId: string | undefined) {
  return useQuery({
    queryKey: ['merchant', 'orders', branchId],
    queryFn: () => getOrdersByBranch(branchId!),
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
      await qc.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
    },
  });
}

export function useCoupons() {
  return useQuery({ queryKey: ['merchant', 'coupons'], queryFn: getCoupons, staleTime: STALE_MEDIUM });
}