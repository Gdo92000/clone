import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { branchSettings } from '../db/schema';
import { requirePermission } from '../middleware/permission';
import { requireTenantOwnership } from '../middleware/tenant';

const route = new Hono();

route.use('*', requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }));

const idParam = z.object({ branchId: z.string().min(1).max(64) });



const upsertSchema = z.object({
  opening_time: z.string().regex(/^\d{2}:\d{2}$/),
  closing_time: z.string().regex(/^\d{2}:\d{2}$/),
  preparation_time: z.string().regex(/^\d+$/),
  minimum_order: z.string().regex(/^\d+(\.\d{1,2})?$/),
  accepts_delivery: z.boolean(),
  accepts_pickup: z.boolean(),
  pix_key: z.string().max(100).optional(),
});

route.get('/:branchId', requireTenantOwnership('branchId'), zValidator('param', idParam), async (c) => {
  const { branchId } = c.req.valid('param');
  const [settings] = await db.select().from(branchSettings).where(eq(branchSettings.branch_id, branchId));
  return c.json(settings);
});

route.put('/:branchId', requireTenantOwnership('branchId'), zValidator('param', idParam), zValidator('json', upsertSchema), async (c) => {

  const { branchId } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(branchSettings).where(eq(branchSettings.branch_id, branchId)).limit(1);
  if (existing.length) {
    await db.update(branchSettings).set({ ...data, updated_at: new Date() }).where(eq(branchSettings.branch_id, branchId));
  } else {
    await db.insert(branchSettings).values({ branch_id: branchId, ...data });
  }
  return c.json({ success: true });
});

export default route;
