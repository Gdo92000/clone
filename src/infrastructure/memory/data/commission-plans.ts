export const mockCommissionPlans = [
  { planId: 'basic', marketplaceFee: 12, deliveryFee: 8, paymentFee: 3.5, additionalFees: [] as { label: string; percentage: number }[] },
  { planId: 'pro', marketplaceFee: 8, deliveryFee: 5, paymentFee: 2.5, additionalFees: [{ label: 'Marketing', percentage: 2 }] },
  { planId: 'premium', marketplaceFee: 5, deliveryFee: 3, paymentFee: 1.5, additionalFees: [{ label: 'Marketing', percentage: 1.5 }] },
];

export const mockPlatformMetrics = {
  totalOrders: 1234,
  totalRevenue: '45678.90',
  avgTicket: 37.02,
  activeStores: 8,
  deliveryPercent: 65,
  takeoutPercent: 35,
};
