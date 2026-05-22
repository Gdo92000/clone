import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { merchantCoupons, orders } from '../db/schema';
import { authMiddleware, getTokenPayload } from '../middleware/auth';

const route = new Hono();

route.use('*', authMiddleware);

route.post('/validate', zValidator('json', z.object({
  code: z.string(),
  branchId: z.string(),
  orderTotal: z.string(),
})), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);
  const { code, branchId, orderTotal } = c.req.valid('json');
  const total = Number(orderTotal);

  const coupon = await db.select().from(merchantCoupons)
    .where(and(eq(merchantCoupons.code, code), eq(merchantCoupons.branch_id, branchId)))
    .limit(1);

  if (!coupon.length) return c.json({ error: 'Cupom inválido para esta loja' }, 404);
  const cp = coupon[0];

  if (!cp.is_active) return c.json({ error: 'Este cupom não está mais ativo' }, 400);
  if (new Date() > new Date(cp.valid_until)) return c.json({ error: 'Este cupom expirou' }, 400);
  if (cp.max_uses !== null && (cp.current_uses ?? 0) >= cp.max_uses) return c.json({ error: 'Limite de usos atingido' }, 400);
  if (Number(cp.min_order) > total) {
    return c.json({ error: `Valor mínimo do pedido para este cupom é R$ ${cp.min_order}` }, 400);
  }

  // Advanced Rules
  const rules = cp.rules;
  if (rules?.first_order_only) {
    const prevOrders = await db.select().from(orders)
      .where(and(eq(orders.user_id, payload.sub), eq(orders.restaurant_id, branchId)))
      .limit(1);
    if (prevOrders.length > 0) return c.json({ error: 'Este cupom é válido apenas para o primeiro pedido' }, 400);
  }

  const discount = cp.discount_type === 'percentage'
    ? total * (Number(cp.discount_value) / 100)
    : Number(cp.discount_value);

  return c.json({
    success: true,
    discount,
    newTotal: total - discount,
    couponName: cp.code,
  });
});

export default route;
