import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { subscriptions } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission(['superadmin', 'admin']));

const companyIdParam = z.object({ id: z.string().min(1) });

const createSchema = z.object({
  company_id: z.string().min(1),
  plan_id: z.enum(['basic', 'pro', 'premium']),
  addon_ids: z.array(z.string()).optional(),
  billing_status: z.enum(['trial', 'active', 'past_due', 'blocked', 'cancelled']).optional(),
  trial_ends_at: z.string().datetime().optional(),
  current_period_ends_at: z.string().datetime(),
  blocked_reason: z.string().optional(),
});

const updateSchema = createSchema.partial();

route.get('/', async (c) => {
  const all = await db.select().from(subscriptions);
  return c.json(all);
});

route.get('/:id', zValidator('param', companyIdParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(subscriptions).where(eq(subscriptions.company_id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

route.post('/', zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const existing = await db.select().from(subscriptions).where(eq(subscriptions.company_id, data.company_id)).limit(1);
  if (existing.length) {
    await db.update(subscriptions).set({
      plan_id: data.plan_id,
      addon_ids: data.addon_ids ?? null,
      billing_status: data.billing_status ?? existing[0].billing_status,
      trial_ends_at: data.trial_ends_at ? new Date(data.trial_ends_at) : null,
      current_period_ends_at: new Date(data.current_period_ends_at),
      blocked_reason: data.blocked_reason ?? null,
      updated_at: new Date(),
    }).where(eq(subscriptions.company_id, data.company_id));
    return c.json({ success: true, upserted: true });
  }
  await db.insert(subscriptions).values({
    company_id: data.company_id,
    plan_id: data.plan_id,
    addon_ids: data.addon_ids ?? null,
    billing_status: data.billing_status ?? 'trial',
    trial_ends_at: data.trial_ends_at ? new Date(data.trial_ends_at) : null,
    current_period_ends_at: new Date(data.current_period_ends_at),
    blocked_reason: data.blocked_reason ?? null,
    created_at: new Date(),
    updated_at: new Date(),
  });
  return c.json({ success: true }, 201);
});

route.put('/:id', zValidator('param', companyIdParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(subscriptions).where(eq(subscriptions.company_id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  const updateData: Record<string, any> = { updated_at: new Date() };
  if (data.plan_id !== undefined) updateData.plan_id = data.plan_id;
  if (data.addon_ids !== undefined) updateData.addon_ids = data.addon_ids;
  if (data.billing_status !== undefined) updateData.billing_status = data.billing_status;
  if (data.trial_ends_at !== undefined) updateData.trial_ends_at = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
  if (data.current_period_ends_at !== undefined) updateData.current_period_ends_at = new Date(data.current_period_ends_at);
  if (data.blocked_reason !== undefined) updateData.blocked_reason = data.blocked_reason;
  await db.update(subscriptions).set(updateData).where(eq(subscriptions.company_id, id));
  return c.json({ success: true });
});

export default route;
