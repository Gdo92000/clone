import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { subscriptionAddons } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
 
const route = new Hono();
 
route.use('*', authMiddleware, requirePermission({ roles: ['superadmin'] }));
 
route.post('/toggle', zValidator('json', z.object({
  subscriptionId: z.string(),
  addonId: z.string(),
})), async (c) => {
  const { subscriptionId, addonId } = c.req.valid('json');
  
  const existing = await db.select()
    .from(subscriptionAddons)
    .where(and(eq(subscriptionAddons.subscription_id, subscriptionId), eq(subscriptionAddons.addon_id, addonId)))
    .limit(1);
  
  if (existing.length) {
    await db.delete(subscriptionAddons)
      .where(and(eq(subscriptionAddons.subscription_id, subscriptionId), eq(subscriptionAddons.addon_id, addonId)));
    return c.json({ success: true, active: false });
  } else {
    await db.insert(subscriptionAddons).values({
      subscription_id: subscriptionId,
      addon_id: addonId,
      activated_at: new Date(),
    });
    return c.json({ success: true, active: true });
  }
});
 
export default route;
