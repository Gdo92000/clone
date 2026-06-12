import { eq, and, sql, inArray } from 'drizzle-orm';
import { db } from '../db';
import { merchantOrders, orders, loyaltySettings, userLoyaltyPoints, subscriptions, subscriptionAddons, addons, pushSubscriptions, users, branches } from '../db/schema';
import { PrintingService } from './printing/service';
import { logger } from '../lib/logger';
import { publish } from './sse';
import { sendPush } from './push';
import type { SSEMessage } from 'hono/streaming';

const MERCHANT_TO_CUSTOMER_STATUS: Record<string, string> = {
  accepted: 'preparing',
  preparing: 'preparing',
  ready: 'ready',
  dispatched: 'dispatched',
  delivered: 'delivered',
  rejected: 'cancelled',
};

interface TokenPayload {
  sub: string;
  role: string;
  company_id?: string;
  branch_id?: string;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: string;
  userId: string;
  role: string;
  companyId?: string;
}

export interface UpdateOrderStatusResult {
  success: boolean;
  error?: string;
  statusCode?: number;
}

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
          eq(addons.is_active, true),
        ),
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    logger.error('Error checking kitchen_auto_print addon', { error, companyId });
    return false;
  }
}

export async function getOrders(payload: TokenPayload): Promise<unknown[] | null> {
  const user = await db.select({ branch_id: users.branch_id, company_id: users.company_id })
    .from(users).where(eq(users.id, payload.sub)).limit(1);
  if (user.length === 0) return null;

  if (payload.role === 'superadmin') {
    return db.select().from(merchantOrders);
  }

  if ((payload.role === 'merchant' || payload.role === 'branch_manager') && user[0].branch_id) {
    return db.select().from(merchantOrders).where(eq(merchantOrders.branch_id, user[0].branch_id));
  }

  if ((payload.role === 'admin' || payload.role === 'company_owner') && user[0].company_id) {
    const companyBranches = await db.select({ id: branches.id }).from(branches)
      .where(eq(branches.company_id, user[0].company_id));
    const branchIds: string[] = companyBranches.map((b) => b.id);
    if (branchIds.length > 0) {
      return db.select().from(merchantOrders).where(inArray(merchantOrders.branch_id, branchIds));
    }
  }

  return [];
}

export async function updateOrderStatus(input: UpdateOrderStatusInput): Promise<UpdateOrderStatusResult> {
  const { orderId, status, userId, role, companyId } = input;

  const rows = await db.select({
    id: merchantOrders.id,
    status: merchantOrders.status,
    branch_id: merchantOrders.branch_id,
    delivery_type: merchantOrders.delivery_type,
  }).from(merchantOrders).where(eq(merchantOrders.id, orderId)).limit(1);

  if (!rows.length) return { success: false, error: 'Not found', statusCode: 404 };
  const existingOrder = rows[0];

  if (role !== 'superadmin') {
    if (role === 'merchant' || role === 'branch_manager') {
      const user = await db.select({ branch_id: users.branch_id }).from(users)
        .where(eq(users.id, userId)).limit(1);
      if (!user.length || !user[0].branch_id || user[0].branch_id !== existingOrder.branch_id) {
        return { success: false, error: 'Acesso negado - você só pode alterar pedidos da própria filial', statusCode: 403 };
      }
    } else if (role === 'admin' || role === 'company_owner') {
      if (!companyId) return { success: false, error: 'Acesso negado', statusCode: 403 };
      const orderBranch = await db.select({ company_id: branches.company_id }).from(branches)
        .where(eq(branches.id, existingOrder.branch_id)).limit(1);
      if (!orderBranch.length) return { success: false, error: 'Branch do pedido não encontrada', statusCode: 404 };
      if (orderBranch[0].company_id !== companyId) {
        return { success: false, error: 'Acesso negado - pedido não pertence à sua empresa', statusCode: 403 };
      }
    }
  }

  const currentStatus = existingOrder.status;
  const newStatus = status;
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
    await tx.update(merchantOrders).set({ status }).where(eq(merchantOrders.id, orderId));

    const customerStatus = MERCHANT_TO_CUSTOMER_STATUS[status];
    if (customerStatus) {
      await tx.update(orders).set({
        status: customerStatus as 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled',
      }).where(eq(orders.id, orderId));
    }

    if (status === 'accepted') {
      const order = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (order.length) {
        const o = order[0];
        const hasAddon = await hasKitchenAutoPrintAddon(o.restaurant_id);

        if (hasAddon) {
          try {
            const printPayload = `ORDER #${o.id}\nCustomer: ${o.user_id}\nTotal: ${o.total}\nItems: ...`;
            const jobId = await PrintingService.enqueuePrintJob(o.restaurant_id, o.id, printPayload);
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
      const order = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (order.length) {
        const o = order[0];
        const settings = await tx.select().from(loyaltySettings)
          .where(eq(loyaltySettings.branch_id, o.restaurant_id)).limit(1);

        if (settings.length && settings[0].enabled) {
          const pointsToAdd = Math.floor(Number(o.total) * Number(settings[0].points_per_real));
          const userPoints = await tx.select().from(userLoyaltyPoints)
            .where(and(
              eq(userLoyaltyPoints.user_id, o.user_id),
              eq(userLoyaltyPoints.branch_id, o.restaurant_id),
            ))
            .limit(1);

          if (userPoints.length) {
            await tx.update(userLoyaltyPoints)
              .set({ points_balance: userPoints[0].points_balance + pointsToAdd, updated_at: new Date() })
              .where(and(
                eq(userLoyaltyPoints.user_id, o.user_id),
                eq(userLoyaltyPoints.branch_id, o.restaurant_id),
              ));
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

  const branchId = existingOrder.branch_id;
  const event: SSEMessage = {
    event: 'order_update',
    data: JSON.stringify({ orderId, status, previousStatus: currentStatus, branchId }),
  };
  publish(`branch:${branchId}`, event);

  const customerOrder = await db.select({ user_id: orders.user_id }).from(orders)
    .where(eq(orders.id, orderId)).limit(1);
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
            { title: 'Flux Delivery', body: message, data: { orderId, status } },
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
        { title: 'Flux Delivery', body: `Pedido #${orderId} atualizado para: ${status}`, data: { orderId, status } },
      );
    }
  }

  return { success: true };
}
