import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { merchantOrders, orders, loyaltySettings, userLoyaltyPoints, subscriptions, subscriptionAddons, addons } from '../db/schema';
import { PrintingService } from '../services/printing/service';
import { logger } from '../lib/logger';

const route = new Hono();

const idParam = z.object({ id: z.string().min(1).max(64) });

const statusSchema = z.object({
  status: z.enum(['new', 'accepted', 'preparing', 'ready', 'dispatched', 'delivered', 'rejected']),
});

/**
 * Verifica se tenant possui addon kitchen_auto_print ativo
 */
async function hasKitchenAutoPrintAddon(companyId: string): Promise<boolean> {
  try {
    const result = await db
      .select({ count: sql<number>`1` })
      .from(subscriptionAddons)
      .innerJoin(addons, eq(subscriptionAddons.addon_id, addons.id))
      .innerJoin(subscriptions, eq(subscriptionAddons.subscription_id, subscriptions.company_id))
      .where(
        and(
          eq(subscriptions.company_id, companyId),
          eq(addons.feature_key, 'kitchen_auto_print'),
          eq(addons.is_active, true)
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    logger.error('Error checking kitchen_auto_print addon', { error, companyId });
    return false;
  }
}

route.get('/', async (c) => {
  const all = await db.select().from(merchantOrders);
  return c.json(all);
});

route.post('/:id/status', zValidator('param', idParam), zValidator('json', statusSchema), async (c) => {
  const { id } = c.req.valid('param');
  const { status } = c.req.valid('json');
  
  const existing = await db.select().from(merchantOrders).where(eq(merchantOrders.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);

  await db.transaction(async (tx) => {
    await tx.update(merchantOrders).set({ status }).where(eq(merchantOrders.id, id));

    if (status === 'accepted') {
      const order = await tx.select().from(orders).where(eq(orders.id, id)).limit(1);
      if (order.length) {
        const o = order[0];
        
        // Feature gating: verifica se tenant possui addon ativo
        const hasAddon = await hasKitchenAutoPrintAddon(o.restaurant_id);
        
        if (hasAddon) {
          try {
            const payload = `ORDER #${o.id}\nCustomer: ${o.user_id}\nTotal: ${o.total}\nItems: ...`;
            const jobId = await PrintingService.enqueuePrintJob(o.restaurant_id, o.id, payload);
            
            logger.info('Kitchen auto-print triggered', {
              eventType: 'kitchen_auto_print_triggered',
              orderId: o.id,
              branchId: o.restaurant_id,
              jobId,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            logger.error('Kitchen auto-print failed', {
              eventType: 'kitchen_auto_print_error',
              orderId: o.id,
              branchId: o.restaurant_id,
              error: error instanceof Error ? error.message : String(error),
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          logger.info('Kitchen auto-print skipped - addon not active', {
            eventType: 'kitchen_auto_print_skipped',
            orderId: o.id,
            branchId: o.restaurant_id,
            reason: 'addon_not_active',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    if (status === 'delivered') {
      const order = await tx.select().from(orders).where(eq(orders.id, id)).limit(1);
      if (order.length) {
        const o = order[0];
        const settings = await tx.select().from(loyaltySettings).where(eq(loyaltySettings.branch_id, o.restaurant_id)).limit(1);
        
        if (settings.length && settings[0].enabled) {
          const pointsToAdd = Math.floor(Number(o.total) * Number(settings[0].points_per_real));
          
          const userPoints = await tx.select().from(userLoyaltyPoints)
            .where(and(eq(userLoyaltyPoints.user_id, o.user_id), eq(userLoyaltyPoints.branch_id, o.restaurant_id)))
            .limit(1);

          if (userPoints.length) {
            await tx.update(userLoyaltyPoints)
              .set({ points_balance: userPoints[0].points_balance + pointsToAdd, updated_at: new Date() })
              .where(and(eq(userLoyaltyPoints.user_id, o.user_id), eq(userLoyaltyPoints.branch_id, o.restaurant_id)));
          } else {
            await tx.insert(userLoyaltyPoints).values({
              id: crypto.randomUUID(),
              user_id: o.user_id,
              branch_id: o.restaurant_id,
              points_balance: pointsToAdd,
              updated_at: new Date(),
            });
          }
        }
      }
    }
  });

  return c.json({ success: true });
});

export default route;
