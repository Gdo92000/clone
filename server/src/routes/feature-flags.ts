import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { feature_flags } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission(['superadmin', 'admin']));

const idParam = z.object({ id: z.string().min(1).max(64) });

const createSchema = z.object({
  company_id: z.string().optional(),
  branch_id: z.string().optional(),
  user_id: z.string().optional(),
  feature_key: z.string().min(1),
  enabled: z.boolean(),
  reason: z.string().optional(),
});

route.get('/', async (c) => {
  const companyId = c.req.query('company_id');
  const branchId = c.req.query('branch_id');
  const conditions: ReturnType<typeof eq>[] = [];
  if (companyId) conditions.push(eq(feature_flags.company_id, companyId));
  if (branchId) conditions.push(eq(feature_flags.branch_id, branchId));
  const query = db.select().from(feature_flags);
  if (conditions.length) {
    const all = await query.where(and(...conditions));
    return c.json(all);
  }
  const all = await query;
  return c.json(all);
});

route.post('/', zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const conditions: ReturnType<typeof eq>[] = [eq(feature_flags.feature_key, data.feature_key)];
  if (data.company_id) conditions.push(eq(feature_flags.company_id, data.company_id));
  if (data.branch_id) conditions.push(eq(feature_flags.branch_id, data.branch_id));
  const existing = await db.select().from(feature_flags).where(and(...conditions)).limit(1);
  if (existing.length) {
    await db.update(feature_flags).set({ ...data, updated_at: new Date() }).where(eq(feature_flags.id, existing[0].id));
    return c.json({ success: true, upserted: true });
  }
  const id = crypto.randomUUID();
  await db.insert(feature_flags).values({ ...data, id, created_at: new Date(), updated_at: new Date() } as typeof feature_flags.$inferInsert);
  return c.json({ success: true, id }, 201);
});

route.delete('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const existing = await db.select().from(feature_flags).where(eq(feature_flags.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.delete(feature_flags).where(eq(feature_flags.id, id));
  return c.json({ success: true });
});

export default route;
