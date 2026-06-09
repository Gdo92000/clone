import { useQuery } from '@tanstack/react-query';
import { merchantApi } from '../api';
import { merchantKeys } from '../api/queryKeys';
import type { MerchantFinance } from '../types/analytics';
import type { MerchantFinanceDTO } from '../dto/analyticsDto';

const STALE_SHORT = 1000 * 60 * 2;

function mapFinance(dto: MerchantFinanceDTO): MerchantFinance {
  return {
    period: dto.period,
    grossRevenue: dto.grossRevenue,
    platformFee: dto.platformFee,
    deliveryCost: dto.deliveryCost,
    netRevenue: dto.netRevenue,
    paidOrders: dto.paidOrders,
    totalOrders: dto.totalOrders,
    rejectedOrders: dto.rejectedOrders,
    paymentMethods: dto.paymentMethods,
    deliveryTypes: dto.deliveryTypes,
  };
}

export function useMerchantFinance(year?: number, month?: number) {
  const y = year ?? new Date().getFullYear();
  const m = month ?? new Date().getMonth() + 1;

  return useQuery({
    queryKey: merchantKeys.finance(y, m),
    queryFn: async () => {
      const dto = await merchantApi.getFinance(y, m);
      return mapFinance(dto);
    },
    staleTime: STALE_SHORT,
  });
}
