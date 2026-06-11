import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { db } from '../db';
import { merchantOrders, orders, loyaltySettings, userLoyaltyPoints, subscriptions, subscriptionAddons, addons, pushSubscriptions, users, branches } from '../db/schema';
import { PrintingService } from '../services/printing/service';
import { logger } from '../lib/logger';
import { tenantIsolationMiddleware } from '../lib/tenant';
import { getTokenPayload } from '../middleware/auth';
import { publish } from '../services/sse';
import { sendPush } from '../services/push';
import type { SSEMessage } from 'hono/streaming';

const route = new Hono();

route.use('*', tenantIsolationMiddleware());

const idParam = z.object({ id: z.string().min(1).max(64) });

const merchantStatusEnum = z.enum(['new', 'accepted', 'preparing', 'ready', 'dispatched', 'delivered', 'rejected']);

const statusSchema = z.object({
  status: merchantStatusEnum,
});

const MERCHANT_TO_CUSTOMER_STATUS: Record<string, string> = {
  accepted: 'preparing',
  preparing: 'preparing',
  ready: 'ready',
  dispatched: 'dispatched',
  delivered: 'delivered',
  rejected: 'cancelled',
};

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
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);
  
  const user = await db.select({ branch_id: users.branch_id, company_id: users.company_id }).from(users).where(eq(users.id, payload.sub)).limit(1);
  if (user.length === 0) return c.json({ error: 'Usuário não encontrado' }, 404);
  
  if (payload.role === 'superadmin') {
    const all = await db.select().from(merchantOrders);
    return c.json(all);
  }

  if (payload.role === 'merchant' && user[0].branch_id) {
    const all = await db.select().from(merchantOrders).where(eq(merchantOrders.branch_id, user[0].branch_id));
    return c.json(all);
  }

  if (payload.role === 'admin' || payload.role === 'company_owner') {
    if (user[0].company_id) {
      const companyBranches = await db.select({ id: branches.id }).from(branches).where(eq(branches.company_id, user[0].company_id));
      const branchIds: string[] = companyBranches.map(b => b.id);
      if (branchIds.length > 0) {
        const all = await db.select().from(merchantOrders).where(inArray(merchantOrders.branch_id, branchIds));
        return c.json(all);
      }
    }
    return c.json([]);
  }

  if (payload.role === 'branch_manager' && user[0].branch_id) {
    const all = await db.select().from(merchantOrders).where(eq(merchantOrders.branch_id, user[0].branch_id));
    return c.json(all);
  }

  return c.json([]);
});

route.post('/:id/status', zValidator('param', idParam), zValidator('json', statusSchema), async (c) => {
  const { id } = c.req.valid('param');
  const { status } = c.req.valid('json');
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);
  
  const rows = await db.select({
    id: merchantOrders.id,
    status: merchantOrders.status,
    branch_id: merchantOrders.branch_id,
    delivery_type: merchantOrders.delivery_type,
  }).from(merchantOrders).where(eq(merchantOrders.id, id)).limit(1);
  if (!rows.length) return c.json({ error: 'Not found' }, 404);
  
  const existingOrder = rows[0];
  
  // Permission check - superadmin pode alterar qualquer pedido
  if (payload.role !== 'superadmin') {
    if (payload.role === 'merchant' || payload.role === 'branch_manager') {
      const user = await db.select({ branch_id: users.branch_id }).from(users).where(eq(users.id, payload.sub)).limit(1);
      if (!user.length || !user[0].branch_id || user[0].branch_id !== existingOrder.branch_id) {
        return c.json({ error: 'Acesso negado - você só pode alterar pedidos da própria filial' }, 403);
      }
    } else if (payload.role === 'admin' || payload.role === 'company_owner') {
      if (!payload.company_id) {
        return c.json({ error: 'Acesso negado' }, 403);
      }
      const orderBranch = await db.select({ company_id: branches.company_id }).from(branches).where(eq(branches.id, existingOrder.branch_id)).limit(1);
      if (!orderBranch.length) return c.json({ error: 'Branch do pedido não encontrada' }, 404);
      if (orderBranch[0].company_id !== payload.company_id) {
        return c.json({ error: 'Acesso negado - pedido não pertence à sua empresa' }, 403);
      }
    }
  }

  const currentStatus = merchantStatusEnum.parse(existingOrder.status);
  const newStatus = merchantStatusEnum.parse(status);
  const isPickup = existingOrder.delivery_type === 'pickup';

  const ALLOWED: Record<string, readonly string[]> = {
    new: ['accepted', 'rejected'],
    accepted: ['preparing'],
    preparing: ['ready'],
    ready: isPickup ? ['delivered'] : ['dispatched'],
    dispatched: ['delivered'],
    delivered: [],
    rejected: [],
  };
  const allowed = ALLOWED[currentStatus];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid order status transition: ${currentStatus} → ${newStatus}`);
  }

  await db.transaction(async (tx) => {
    await tx.update(merchantOrders).set({ status }).where(eq(merchantOrders.id, id));

    const customerStatus = MERCHANT_TO_CUSTOMER_STATUS[status];
    if (customerStatus) {
      await tx.update(orders).set({ status: customerStatus as 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' }).where(eq(orders.id, id));
    }

    if (status === 'accepted') {
      const order = await tx.select().from(orders).where(eq(orders.id, id)).limit(1);
      if (order.length) {
        const o = order[0];
        
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

  const branchId = z.string().parse(existingOrder.branch_id);
  const event: SSEMessage = {
    event: 'order_update',
    data: JSON.stringify({ orderId: id, status, previousStatus: currentStatus, branchId }),
  };
  publish(`branch:${branchId}`, event);

  const customerOrder = await db.select({ user_id: orders.user_id }).from(orders).where(eq(orders.id, id)).limit(1);
  if (customerOrder.length > 0) {
    const customerUserId = customerOrder[0].user_id;

    publish(`user:${customerUserId}`, event);

    const subs = await db.select({ endpoint: pushSubscriptions.endpoint, keys: pushSubscriptions.keys })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.user_id, customerUserId));

    if (subs.length > 0) {
      const statusMessages: Record<string, Record<string, string | undefined>> = {
        delivery: {
          accepted: 'Seu pedido foi aceito pelo restaurante.',
          preparing: 'Seu pedido está em preparo.',
          ready: 'Seu pedido está pronto!',
          dispatched: 'Seu pedido saiu para entrega.',
          delivered: 'Seu pedido foi entregue.',
          rejected: 'Seu pedido foi recusado.',
        },
        pickup: {
          accepted: 'Seu pedido foi aceito pelo restaurante.',
          preparing: 'Seu pedido está em preparo.',
          ready: 'Seu pedido está pronto para retirada!',
          delivered: 'Pedido retirado. Obrigado!',
          rejected: 'Seu pedido foi recusado.',
        },
      };
      const messages = statusMessages[existingOrder.delivery_type];
      const message = messages[status];
      if (message) {
        for (const sub of subs) {
          await sendPush(
            { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
            { title: 'Flux Delivery', body: message, data: { orderId: id, status } },
          );
        }
      }
    }
  }

  const merchantUsers = await db.select({ id: users.id }).from(users)
    .where(and(eq(users.branch_id, branchId), eq(users.role, 'merchant')));
  for (const mu of merchantUsers) {
    const subs = await db.select({ endpoint: pushSubscriptions.endpoint, keys: pushSubscriptions.keys })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.user_id, mu.id));
    for (const sub of subs) {
      void sendPush(
        { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
        { title: 'Flux Delivery', body: `Pedido #${id} atualizado para: ${status}`, data: { orderId: id, status } },
      );
    }
  }

  return c.json({ success: true });
});

export default route;
