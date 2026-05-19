import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { invoices } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission(['superadmin', 'admin']));

const companyIdParam = z.object({ id: z.string().min(1) });

route.get('/', async (c) => {
  const all = await db.select().from(invoices);
  return c.json(all);
});

route.get('/:id', zValidator('param', companyIdParam), async (c) => {
  const { id } = c.req.valid('param');
  const items = await db.select().from(invoices).where(eq(invoices.company_id, id));
  if (!items.length) return c.json({ error: 'Not found' }, 404);
  return c.json(items);
});

export default route;
