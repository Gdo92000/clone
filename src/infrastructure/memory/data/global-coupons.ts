import type { GlobalCoupon } from 'src/domain/entities/Coupon';

export const mockGlobalCoupons: GlobalCoupon[] = [
  { id: 'gc-1', code: 'BEMVINDO10', description: '10% off em pedidos acima de R$ 20', discountType: 'percentage', discountValue: 10, minOrder: 20, maxUses: 1000, currentUses: 234, validUntil: new Date(Date.now() + 90 * 86400000).toISOString(), isActive: true, createdBy: 'user-1' },
  { id: 'gc-2', code: 'FRETEGRATIS10', description: 'Frete grátis em pedidos acima de R$ 30', discountType: 'fixed', discountValue: 10, minOrder: 30, maxUses: 500, currentUses: 89, validUntil: new Date(Date.now() + 60 * 86400000).toISOString(), isActive: true, createdBy: 'user-1' },
];
