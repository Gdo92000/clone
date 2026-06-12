import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { merchantCoupons, orders } from '../db/schema';

export interface ValidateCouponInput {
  code: string;
  branchId: string;
  orderTotal: string;
  userId: string;
}

export interface ValidateCouponResult {
  success: true;
  discount: number;
  newTotal: number;
  couponName: string;
}

export class CouponError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'CouponError';
  }
}

export async function validateCoupon(input: ValidateCouponInput): Promise<ValidateCouponResult> {
  const { code, branchId, orderTotal, userId } = input;
  const total = Number(orderTotal);

  const coupon = await db.select().from(merchantCoupons)
    .where(and(eq(merchantCoupons.code, code), eq(merchantCoupons.branch_id, branchId)))
    .limit(1);

  if (!coupon.length) throw new CouponError('Cupom inválido para esta loja', 404);
  const cp = coupon[0];

  if (!cp.is_active) throw new CouponError('Este cupom não está mais ativo', 400);
  if (new Date() > new Date(cp.valid_until)) throw new CouponError('Este cupom expirou', 400);
  if (cp.max_uses !== null && (cp.current_uses ?? 0) >= cp.max_uses) {
    throw new CouponError('Limite de usos atingido', 400);
  }
  if (Number(cp.min_order) > total) {
    throw new CouponError(`Valor mínimo do pedido para este cupom é R$ ${cp.min_order}`, 400);
  }

  if (cp.rules?.first_order_only) {
    const prevOrders = await db.select().from(orders)
      .where(and(eq(orders.user_id, userId), eq(orders.restaurant_id, branchId)))
      .limit(1);
    if (prevOrders.length > 0) throw new CouponError('Este cupom é válido apenas para o primeiro pedido', 400);
  }

  const discount = cp.discount_type === 'percentage'
    ? total * (Number(cp.discount_value) / 100)
    : Number(cp.discount_value);

  return {
    success: true,
    discount,
    newTotal: total - discount,
    couponName: cp.code,
  };
}
