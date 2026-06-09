import { useQuery } from '@tanstack/react-query';
import { merchantApi } from '../api';
import { merchantKeys } from '../api/queryKeys';
import type { MerchantAnalytics } from '../types/analytics';
import type { MerchantAnalyticsDTO } from '../dto/analyticsDto';

const STALE_SHORT = 1000 * 60 * 2;

function mapAnalytics(dto: MerchantAnalyticsDTO): MerchantAnalytics {
  return {
    revenue: dto.revenue,
    avgTicket: dto.avgTicket,
    orderCount: dto.orderCount,
    ordersByDay: dto.ordersByDay,
    statusBreakdown: dto.statusBreakdown,
  };
}

export function useMerchantAnalytics(days = 30) {
  return useQuery({
    queryKey: merchantKeys.analytics(days),
    queryFn: async () => {
      const dto = await merchantApi.getAnalytics(days);
      return mapAnalytics(dto);
    },
    staleTime: STALE_SHORT,
  });
}
