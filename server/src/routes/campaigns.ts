import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { campaigns } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission(['superadmin', 'admin', 'merchant']));

const idParam = z.object({ id: z.string().min(1).max(64) });

const createSchema = z.object({
  branch_id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  discount_percentage: z.string().optional(),
  status: z.enum(['active', 'paused', 'finished']).optional(),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
});

const updateSchema = createSchema.partial();

route.get('/', async (c) => {
  const branchId = c.req.query('branch_id');
  if (branchId) {
    const all = await db.select().from(campaigns).where(eq(campaigns.branch_id, branchId));
    return c.json(all);
  }
  const all = await db.select().from(campaigns);
  return c.json(all);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

route.post('/', zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  await db.insert(campaigns).values({
    id,
    branch_id: data.branch_id,
    name: data.name,
    description: data.description ?? null,
    discount_percentage: data.discount_percentage ?? null,
    status: data.status ?? 'active',
    starts_at: data.starts_at ? new Date(data.starts_at) : null,
    ends_at: data.ends_at ? new Date(data.ends_at) : null,
    created_at: new Date(),
  });
  return c.json({ success: true, id }, 201);
});

route.put('/:id', zValidator('param', idParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  const updateData: Record<string, any> = {};
  if (data.branch_id !== undefined) updateData.branch_id = data.branch_id;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.discount_percentage !== undefined) updateData.discount_percentage = data.discount_percentage;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.starts_at !== undefined) updateData.starts_at = data.starts_at ? new Date(data.starts_at) : null;
  if (data.ends_at !== undefined) updateData.ends_at = data.ends_at ? new Date(data.ends_at) : null;
  await db.update(campaigns).set(updateData).where(eq(campaigns.id, id));
  return c.json({ success: true });
});

route.delete('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const existing = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.delete(campaigns).where(eq(campaigns.id, id));
  return c.json({ success: true });
});

export default route;
