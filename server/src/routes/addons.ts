import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { addons } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission(['superadmin', 'admin']));

const idParam = z.object({ id: z.string().min(1).max(64) });

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  monthly_price: z.string(),
  feature_key: z.string().min(1),
});

const updateSchema = createSchema.partial();

route.get('/', async (c) => {
  const all = await db.select().from(addons).where(eq(addons.is_active, true));
  return c.json(all);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(addons).where(eq(addons.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

route.post('/', zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  await db.insert(addons).values({ ...data, id, created_at: new Date() } as typeof addons.$inferInsert);
  return c.json({ success: true, id }, 201);
});

route.put('/:id', zValidator('param', idParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(addons).where(eq(addons.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(addons).set(data).where(eq(addons.id, id));
  return c.json({ success: true });
});

route.delete('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const existing = await db.select().from(addons).where(eq(addons.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(addons).set({ is_active: false }).where(eq(addons.id, id));
  return c.json({ success: true });
});

export default route;
