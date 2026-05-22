import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { plans } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

const idParam = z.object({ id: z.enum(['basic', 'pro', 'premium']) });

const createSchema = z.object({
  name: z.string().min(1).max(100),
  monthly_price: z.string(),
  description: z.string().optional(),
  max_branches: z.number().int().optional(),
  max_products: z.number().int().optional(),
  max_users: z.number().int().optional(),
  max_campaigns: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

route.get('/', async (c) => {
  const all = await db.select().from(plans).where(eq(plans.is_active, true));
  return c.json(all);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

route.post('/', authMiddleware, requirePermission({ roles: ['superadmin', 'admin'] }), zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const id = data.name.toLowerCase() as 'basic' | 'pro' | 'premium';
  const existing = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  if (existing.length) return c.json({ error: 'Plan already exists' }, 409);
  await db.insert(plans).values({ id, ...data, created_at: new Date() });
  return c.json({ success: true }, 201);
});

route.put('/:id', authMiddleware, requirePermission({ roles: ['superadmin', 'admin'] }), zValidator('param', idParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(plans).set(data).where(eq(plans.id, id));
  return c.json({ success: true });
});

export default route;
