import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../../db';
import { users, addresses, branches, orders, orderItems, merchantOrders, merchantOrderItems, menuItems, idempotencyKeys } from '../../db/schema';
import { logger } from '../../lib/logger';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type Order = InferSelectModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type MerchantOrder = InferSelectModel<typeof merchantOrders>;
export type MerchantOrderItem = InferSelectModel<typeof merchantOrderItems>;
export type NewOrder = InferInsertModel<typeof orders>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;
export type NewMerchantOrderItem = InferInsertModel<typeof merchantOrderItems>;

export interface OrderItemInput {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  additives?: unknown;
  notes?: string;
}

export interface CreateOrderInput {
  restaurant_id: string;
  delivery_type?: 'delivery' | 'pickup';
  payment_method: 'credit' | 'debit' | 'pix' | 'cash' | 'meal_ticket';
  address_id?: string;
  subtotal: number;
  delivery_fee?: number;
  discount?: number;
  total: number;
  notes?: string;
  estimated_time?: string;
  items: OrderItemInput[];
  customer_name: string;
  customer_phone?: string;
  customer_address: string;
}

export interface CreateConsumerOrderResult {
  order: Order;
  items: OrderItem[];
  mirror: MerchantOrder;
  mirrorItems: MerchantOrderItem[];
}

export class MirrorServiceError extends Error {
  public override readonly name = 'MirrorServiceError';
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

export async function findBranchForRestaurant(restaurantId: string): Promise<{ id: string } | null> {
  const rows = await db.select({ id: branches.id })
    .from(branches)
    .where(eq(branches.id, restaurantId))
    .limit(1);
  return rows.length > 0 ? rows[0] : null;
}

async function validateMenuItems(restaurantId: string, items: OrderItemInput[]): Promise<void> {
  const uniqueIds = [...new Set(items.map((i) => i.menu_item_id))];
  const found = await db.select({ id: menuItems.id })
    .from(menuItems)
    .where(and(eq(menuItems.restaurant_id, restaurantId), inArray(menuItems.id, uniqueIds)));

  const foundIds = new Set(found.map((f) => f.id));
  const missing = uniqueIds.filter((id) => !foundIds.has(id));

  if (missing.length > 0) {
    throw new MirrorServiceError(
      `menu_item_id(s) não encontrado(s) ou não pertence(m) ao restaurante: ${missing.join(', ')}`,
      'INVALID_MENU_ITEM',
    );
  }
}

export async function createConsumerOrderWithMirror(
  userId: string,
  input: CreateOrderInput,
  idempotencyKey?: string,
): Promise<CreateConsumerOrderResult> {
  const userRows = await db.select({ name: users.name, phone: users.phone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userRows.length === 0) {
    throw new MirrorServiceError('Usuário não encontrado', 'USER_NOT_FOUND');
  }
  const dbUser = userRows[0];

  if (input.address_id) {
    const addrRows = await db.select({ user_id: addresses.user_id })
      .from(addresses)
      .where(eq(addresses.id, input.address_id))
      .limit(1);
    if (addrRows.length === 0) {
      throw new MirrorServiceError('Endereço não encontrado', 'ADDRESS_NOT_FOUND');
    }
    if (addrRows[0].user_id !== userId) {
      throw new MirrorServiceError('Endereço não pertence ao usuário', 'ADDRESS_FORBIDDEN');
    }
  }

  await validateMenuItems(input.restaurant_id, input.items);

  const branch = await findBranchForRestaurant(input.restaurant_id);
  if (!branch) {
    throw new MirrorServiceError('Nenhuma filial encontrada para o restaurante', 'BRANCH_NOT_FOUND');
  }

  const customerName = input.customer_name || dbUser.name;
  const customerPhone = input.customer_phone || dbUser.phone || undefined;
  const customerAddress = input.customer_address;

  const orderId = crypto.randomUUID();
  const now = new Date();

  try {
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values({
        id: orderId,
        user_id: userId,
        restaurant_id: input.restaurant_id,
        status: 'confirmed',
        delivery_type: input.delivery_type ?? 'delivery',
        payment_method: input.payment_method,
        address_id: input.address_id ?? null,
        subtotal: String(input.subtotal),
        delivery_fee: input.delivery_fee !== undefined ? String(input.delivery_fee) : '0',
        discount: input.discount !== undefined ? String(input.discount) : '0',
        total: String(input.total),
        notes: input.notes ?? null,
        estimated_time: input.estimated_time ?? null,
        created_at: now,
        updated_at: now,
      }).returning();

      const itemsToInsert: NewOrderItem[] = input.items.map((item) => ({
        id: crypto.randomUUID(),
        order_id: orderId,
        menu_item_id: item.menu_item_id,
        name: item.name,
        quantity: item.quantity,
        price: String(item.price),
        additives: item.additives as never,
        notes: item.notes ?? null,
      }));

      const items = await tx.insert(orderItems).values(itemsToInsert).returning();

      const [mirror] = await tx.insert(merchantOrders).values({
        id: orderId,
        branch_id: branch.id,
        customer_name: customerName,
        customer_address: customerAddress,
        customer_phone: customerPhone ?? null,
        status: 'new',
        payment_method: order.payment_method,
        delivery_type: order.delivery_type,
        total: order.total,
        notes: order.notes ?? null,
        created_at: now,
        updated_at: now,
      }).returning();

      let mirrorItems: MerchantOrderItem[] = [];
      if (items.length > 0) {
        const merchantItemsToInsert: NewMerchantOrderItem[] = items.map((it) => ({
          id: crypto.randomUUID(),
          merchant_order_id: orderId,
          name: it.name,
          quantity: it.quantity,
          price: it.price,
        }));
        mirrorItems = await tx.insert(merchantOrderItems).values(merchantItemsToInsert).returning();
      }

      if (idempotencyKey) {
        const responseBody = {
          id: order.id,
          status: order.status,
          total: order.total,
          restaurant_id: order.restaurant_id,
          created_at: order.created_at,
          items: items.map((it) => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            price: it.price,
          })),
        };
        await tx.update(idempotencyKeys)
          .set({ status: 'completed', response_status: 201, response_body: responseBody })
          .where(eq(idempotencyKeys.idempotency_key, idempotencyKey));
      }

      logger.info('Consumer order created with mirror', {
        eventType: 'consumer_order_mirrored',
        orderId,
        branchId: branch.id,
        itemsCount: items.length,
        timestamp: new Date().toISOString(),
      });

      return { order, items, mirror, mirrorItems };
    });
  } catch (err) {
    if (err instanceof MirrorServiceError) throw err;
    logger.error('Failed to create consumer order with mirror — transaction rolled back', {
      eventType: 'consumer_order_mirror_failed',
      orderId,
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    });
    throw err;
  }
}

export const MirrorService = {
  createConsumerOrderWithMirror,
  findBranchForRestaurant,
};
