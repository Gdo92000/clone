import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { capabilities } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

const idParam = z.object({ id: z.string().min(1).max(64) });

const createSchema = z.object({
  feature_key: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  monthly_price: z.string().optional(),
  category: z.enum(['core', 'premium', 'addon', 'enterprise', 'financial', 'automation', 'analytics', 'integration', 'operations']),
  charge_type: z.enum(['included', 'monthly_addon', 'usage_based', 'enterprise_contract']).optional(),
  required_plan: z.enum(['basic', 'pro', 'premium']).optional(),
  dependencies: z.array(z.string()).optional(),
});

const updateSchema = createSchema.partial();

route.get('/', async (c) => {
  const all = await db.select().from(capabilities);
  return c.json(all);
});

route.post('/', authMiddleware, requirePermission({ roles: ['superadmin', 'admin'] }), zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  await db.insert(capabilities).values({ ...data, id, created_at: new Date() } as typeof capabilities.$inferInsert);
  return c.json({ success: true, id }, 201);
});

route.put('/:id', authMiddleware, requirePermission({ roles: ['superadmin', 'admin'] }), zValidator('param', idParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(capabilities).where(eq(capabilities.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(capabilities).set(data).where(eq(capabilities.id, id));
  return c.json({ success: true });
});

route.delete('/:id', authMiddleware, requirePermission({ roles: ['superadmin', 'admin'] }), zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const existing = await db.select().from(capabilities).where(eq(capabilities.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.delete(capabilities).where(eq(capabilities.id, id));
  return c.json({ success: true });
});

export default route;
