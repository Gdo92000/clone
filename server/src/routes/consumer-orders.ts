import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { orders, restaurants } from '../db/schema';
import { authMiddleware, getTokenPayload } from '../middleware/auth';

const route = new Hono();

route.use('*', authMiddleware);

route.get('/', async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const result = await db.select({
    id: orders.id,
    user_id: orders.user_id,
    restaurant_id: orders.restaurant_id,
    status: orders.status,
    delivery_type: orders.delivery_type,
    payment_method: orders.payment_method,
    subtotal: orders.subtotal,
    delivery_fee: orders.delivery_fee,
    discount: orders.discount,
    total: orders.total,
    notes: orders.notes,
    estimated_time: orders.estimated_time,
    created_at: orders.created_at,
    updated_at: orders.updated_at,
    restaurant_name: restaurants.name,
  }).from(orders)
    .leftJoin(restaurants, eq(orders.restaurant_id, restaurants.id))
    .where(eq(orders.user_id, payload.sub))
    .orderBy(desc(orders.created_at));
  return c.json(result);
});

export default route;
