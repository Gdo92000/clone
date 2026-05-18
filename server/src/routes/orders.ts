import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { merchantOrders } from '../db/schema';

const route = new Hono();

const idParam = z.object({ id: z.string().min(1).max(64) });

const statusSchema = z.object({
  status: z.enum(['new', 'accepted', 'preparing', 'ready', 'dispatched', 'delivered', 'rejected']),
});

route.get('/', async (c) => {
  const all = await db.select().from(merchantOrders);
  return c.json(all);
});

route.post('/:id/status', zValidator('param', idParam), zValidator('json', statusSchema), async (c) => {
  const { id } = c.req.valid('param');
  const { status } = c.req.valid('json');
  const existing = await db.select().from(merchantOrders).where(eq(merchantOrders.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(merchantOrders).set({ status }).where(eq(merchantOrders.id, id));
  return c.json({ success: true });
});

export default route;
