export interface CouponValidation {
  valid: boolean;
  reason?: string;
}

export function validateCouponUsage(currentUses: number, maxUses: number): CouponValidation {
  if (currentUses >= maxUses) return { valid: false, reason: 'Cupom esgotado' };
  return { valid: true };
}

export interface CouponDiscount {
  type: 'percentage' | 'fixed';
  value: number;
}

export function formatDiscount(coupon: CouponDiscount): string {
  return coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`;
}

export function isCouponActive(validUntil: string, isActive: boolean): boolean {
  if (!isActive) return false;
  return new Date(validUntil) > new Date();
}

export function couponUsagePercent(currentUses: number, maxUses: number): number {
  if (maxUses <= 0) return 0;
  return Math.round((currentUses / maxUses) * 100);
}