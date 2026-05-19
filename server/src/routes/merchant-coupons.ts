import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { merchantCoupons } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission(['superadmin', 'admin', 'merchant']));

const idParam = z.object({ id: z.string().min(1).max(64) });

const createSchema = z.object({
  branch_id: z.string().min(1),
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.string(),
  min_order: z.string().optional(),
  max_uses: z.number().int().optional(),
  valid_until: z.string().datetime(),
});

const updateSchema = createSchema.partial();

route.get('/', async (c) => {
  const branchId = c.req.query('branch_id');
  if (branchId) {
    const all = await db.select().from(merchantCoupons).where(eq(merchantCoupons.branch_id, branchId));
    return c.json(all);
  }
  const all = await db.select().from(merchantCoupons);
  return c.json(all);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(merchantCoupons).where(eq(merchantCoupons.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

route.post('/', zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  await db.insert(merchantCoupons).values({
    id,
    branch_id: data.branch_id,
    code: data.code,
    description: data.description ?? null,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_order: data.min_order ?? null,
    max_uses: data.max_uses ?? null,
    current_uses: 0,
    valid_until: new Date(data.valid_until),
    is_active: true,
    created_at: new Date(),
  });
  return c.json({ success: true, id }, 201);
});

route.put('/:id', zValidator('param', idParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(merchantCoupons).where(eq(merchantCoupons.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  const updateData: Record<string, any> = {};
  if (data.branch_id !== undefined) updateData.branch_id = data.branch_id;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.discount_type !== undefined) updateData.discount_type = data.discount_type;
  if (data.discount_value !== undefined) updateData.discount_value = data.discount_value;
  if (data.min_order !== undefined) updateData.min_order = data.min_order;
  if (data.max_uses !== undefined) updateData.max_uses = data.max_uses;
  if (data.valid_until !== undefined) updateData.valid_until = new Date(data.valid_until);
  await db.update(merchantCoupons).set(updateData).where(eq(merchantCoupons.id, id));
  return c.json({ success: true });
});

route.delete('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const existing = await db.select().from(merchantCoupons).where(eq(merchantCoupons.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(merchantCoupons).set({ is_active: false }).where(eq(merchantCoupons.id, id));
  return c.json({ success: true });
});

export default route;
