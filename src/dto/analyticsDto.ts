export interface MerchantAnalyticsDTO {
  revenue: number;
  avgTicket: number;
  orderCount: number;
  ordersByDay: Array<{ date: string; revenue: number }>;
  statusBreakdown: Record<string, number>;
}

export interface MerchantFinanceDTO {
  period: { year: number; month: number };
  grossRevenue: number;
  platformFee: number;
  deliveryCost: number;
  netRevenue: number;
  paidOrders: number;
  totalOrders: number;
  rejectedOrders: number;
  paymentMethods: Record<string, number>;
  deliveryTypes: Record<string, number>;
}
