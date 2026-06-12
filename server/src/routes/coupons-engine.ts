import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, getTokenPayload } from '../middleware/auth';
import { validateCoupon, CouponError } from '../services/couponService';

const route = new Hono();

route.use('*', authMiddleware);

route.post('/validate', zValidator('json', z.object({
  code: z.string(),
  branchId: z.string(),
  orderTotal: z.string(),
})), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  try {
    const result = await validateCoupon({
      ...c.req.valid('json'),
      userId: payload.sub,
    });
    return c.json(result);
  } catch (err) {
    if (err instanceof CouponError) {
      return c.json({ error: err.message }, err.statusCode as 400 | 401 | 403 | 404);
    }
    throw err;
  }
});

export default route;
