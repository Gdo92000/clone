export type DiscountType = 'percentage' | 'fixed';

export interface MerchantCoupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number;
  maxUses: number;
  currentUses: number;
  validUntil: string;
  isActive: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discountType: DiscountType;
  discountValue: number;
  budget: number;
  usedBudget: number;
  isActive: boolean;
}

export interface GlobalCoupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number;
  maxUses: number;
  currentUses: number;
  validUntil: string;
  isActive: boolean;
  createdBy: string;
}
