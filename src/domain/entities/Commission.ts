export interface CommissionPlan {
  planId: string;
  marketplaceFee: number;
  deliveryFee: number;
  paymentFee: number;
  additionalFees: { label: string; percentage: number }[];
}
