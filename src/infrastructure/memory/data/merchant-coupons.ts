import type { MerchantCoupon, Campaign } from 'src/domain/entities/Coupon';
import type { BranchSettings } from 'src/domain/entities/Company';

export const mockBranchSettings: BranchSettings[] = [
  { branchId: 'branch-1', openingTime: '08:00', closingTime: '23:00', preparationTime: 20, minimumOrder: 15.00, acceptsDelivery: true, acceptsPickup: true, pixKey: 'burgerhouse@pix.com' },
  { branchId: 'branch-2', openingTime: '09:00', closingTime: '22:00', preparationTime: 25, minimumOrder: 20.00, acceptsDelivery: true, acceptsPickup: true, pixKey: 'burgerhouse.vila@pix.com' },
  { branchId: 'branch-3', openingTime: '10:00', closingTime: '22:30', preparationTime: 30, minimumOrder: 25.00, acceptsDelivery: true, acceptsPickup: false, pixKey: 'sakura@pix.com' },
];

export const mockCoupons: MerchantCoupon[] = [
  { id: 'coup-1', code: 'BURGER10', description: '10% off em pedidos acima de R$ 30', discountType: 'percentage', discountValue: 10, minOrder: 30, maxUses: 500, currentUses: 123, validUntil: new Date(Date.now() + 30 * 86400000).toISOString(), isActive: true },
  { id: 'coup-2', code: 'FRETEGRATIS', description: 'Frete grátis em pedidos acima de R$ 40', discountType: 'fixed', discountValue: 5, minOrder: 40, maxUses: 200, currentUses: 45, validUntil: new Date(Date.now() + 15 * 86400000).toISOString(), isActive: true },
  { id: 'coup-3', code: 'BURGER15', description: '15% off em pedidos acima de R$ 50', discountType: 'percentage', discountValue: 15, minOrder: 50, maxUses: 300, currentUses: 89, validUntil: new Date(Date.now() + 7 * 86400000).toISOString(), isActive: false },
];

export const mockCampaigns: Campaign[] = [
  { id: 'camp-1', name: 'Semana do Hambúrguer', description: '', discountType: 'percentage', discountValue: 10, startDate: '', endDate: '', budget: 0, usedBudget: 0, isActive: true },
  { id: 'camp-2', name: 'Happy Hour', description: '', discountType: 'percentage', discountValue: 15, startDate: '', endDate: '', budget: 0, usedBudget: 0, isActive: true },
];
