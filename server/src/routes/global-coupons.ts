import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { globalCoupons } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission({ roles: ['superadmin', 'admin'] }));

const idParam = z.object({ id: z.string().min(1).max(64) });

const datetimeField = z.iso.datetime();
const createSchema = z.object({
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.string(),
  min_order: z.string().optional(),
  max_uses: z.number().int().optional(),
  valid_from: datetimeField,
  valid_until: datetimeField,
});

const updateSchema = createSchema.partial();

route.get('/', async (c) => {
  const all = await db.select().from(globalCoupons);
  return c.json(all);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(globalCoupons).where(eq(globalCoupons.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

route.post('/', zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  await db.insert(globalCoupons).values({
    id,
    code: data.code,
    description: data.description ?? null,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_order: data.min_order ?? null,
    max_uses: data.max_uses ?? null,
    current_uses: 0,
    valid_from: new Date(data.valid_from),
    valid_until: new Date(data.valid_until),
    is_active: true,
    created_at: new Date(),
  });
  return c.json({ success: true, id }, 201);
});

route.put('/:id', zValidator('param', idParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(globalCoupons).where(eq(globalCoupons.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(globalCoupons).set({
    ...(data.code !== undefined && { code: data.code }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.discount_type !== undefined && { discount_type: data.discount_type }),
    ...(data.discount_value !== undefined && { discount_value: data.discount_value }),
    ...(data.min_order !== undefined && { min_order: data.min_order }),
    ...(data.max_uses !== undefined && { max_uses: data.max_uses }),
    ...(data.valid_from !== undefined && { valid_from: new Date(data.valid_from) }),
    ...(data.valid_until !== undefined && { valid_until: new Date(data.valid_until) }),
  }).where(eq(globalCoupons.id, id));
  return c.json({ success: true });
});

route.delete('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const existing = await db.select().from(globalCoupons).where(eq(globalCoupons.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(globalCoupons).set({ is_active: false }).where(eq(globalCoupons.id, id));
  return c.json({ success: true });
});

export default route;
