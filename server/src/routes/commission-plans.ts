import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { commissionPlans } from '../db/schema';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', requirePermission({ roles: ['superadmin'] }));

const DEFAULT_PLANS = [
  { plan_id: 'basic', marketplace_fee: '12', delivery_fee: '8', payment_fee: '3.5', additional_fees: [{ label: 'Marketing', percentage: 2 }] },
  { plan_id: 'pro', marketplace_fee: '8', delivery_fee: '5', payment_fee: '2.5', additional_fees: [{ label: 'Marketing', percentage: 1.5 }] },
  { plan_id: 'enterprise', marketplace_fee: '5', delivery_fee: '3', payment_fee: '1.5', additional_fees: [] },
];

route.get('/', async (c) => {
  let plans = await db.select().from(commissionPlans).orderBy(commissionPlans.plan_id);
  
  if (plans.length === 0) {
    await db.insert(commissionPlans).values(DEFAULT_PLANS);
    plans = await db.select().from(commissionPlans).orderBy(commissionPlans.plan_id);
  }
  
  return c.json(plans);
});

const updateSchema = z.object({
  marketplace_fee: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  delivery_fee: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  payment_fee: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  additional_fees: z.array(z.object({ label: z.string(), percentage: z.number() })).optional(),
});

route.put('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const [existing] = await db.select().from(commissionPlans).where(eq(commissionPlans.plan_id, id));
  if (!existing) {
    await db.insert(commissionPlans).values({ plan_id: id, ...data });
  } else {
    await db.update(commissionPlans).set({ ...data, updated_at: new Date() }).where(eq(commissionPlans.plan_id, id));
  }
  return c.json({ success: true });
});

export default route;
