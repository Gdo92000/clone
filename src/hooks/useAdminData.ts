import { useQuery } from '@tanstack/react-query';
import { merchantApi } from '../api';
import { companyListDtoToModel, orderListDtoToModel } from '../mappers/merchantMapper';
import type { MerchantCompany } from '../types';
import { adminKeys } from '../api/queryKeys';

const STALE = 1000 * 60 * 5;

export function useAdminCompanies() {
  return useQuery<MerchantCompany[]>({
    queryKey: adminKeys.companies,
    queryFn: () => merchantApi.getCompanies().then(companyListDtoToModel),
    staleTime: STALE,
  });
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: adminKeys.metrics,
    queryFn: async () => {
      const [companies, branches, orders] = await Promise.all([
        merchantApi.getCompanies(),
        merchantApi.getBranches(),
        merchantApi.getOrders(),
      ]);
      const orderModels = orderListDtoToModel(orders);
      const today = new Date().toISOString().slice(0, 10);
      const ordersToday = orderModels.filter((o) => o.createdAt.startsWith(today));
      const grossValue = ordersToday.reduce((sum, o) => sum + o.total, 0);
      return {
        companies: companies.length,
        branches: branches.length,
        ordersToday: ordersToday.length,
        grossValue,
      };
    },
    staleTime: STALE,
  });
}
