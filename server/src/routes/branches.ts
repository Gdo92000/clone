import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { branches, merchantMenuItems, merchantOrders } from '../db/schema';

const route = new Hono();

const idParam = z.object({ id: z.string().min(1).max(64) });

route.get('/', async (c) => {
  const all = await db.select().from(branches);
  return c.json(all);
});

route.get('/:id/menu-items', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const items = await db.select().from(merchantMenuItems).where(eq(merchantMenuItems.branch_id, id));
  return c.json(items);
});

route.get('/:id/orders', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const orders = await db.select().from(merchantOrders).where(eq(merchantOrders.branch_id, id));
  return c.json(orders);
});

export default route;
