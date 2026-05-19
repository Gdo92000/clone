import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { supportTickets } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission(['superadmin', 'admin']));

const idParam = z.object({ id: z.string().min(1).max(64) });

const updateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
});

route.get('/', async (c) => {
  const all = await db.select().from(supportTickets);
  return c.json(all);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

route.put('/:id', zValidator('param', idParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const { status } = c.req.valid('json');
  const existing = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(supportTickets).set({ status, updated_at: new Date() }).where(eq(supportTickets.id, id));
  return c.json({ success: true });
});

export default route;
