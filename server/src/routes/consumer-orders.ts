import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, getTokenPayload } from '../middleware/auth';
import { db } from '../db';
import { orders, orderItems, restaurants, addresses, users, idempotencyKeys, pushSubscriptions } from '../db/schema';
import { eq, and, lte, desc } from 'drizzle-orm';
import { createConsumerOrderWithMirror, MirrorServiceError } from '../services/orders/mirrorService';
import { sendPush } from '../services/push';
import { logger } from '../lib/logger';

const POLL_INTERVALS_MS = [100, 200, 400, 800, 800];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollIdempotencyResult(
  key: string,
): Promise<{ status: string; response_status: number | null; response_body: unknown } | null> {
  const startMs = Date.now();
  for (const delay of POLL_INTERVALS_MS) {
    await sleep(delay);
    const rows = await db.select({
      status: idempotencyKeys.status,
      response_status: idempotencyKeys.response_status,
      response_body: idempotencyKeys.response_body,
      created_at: idempotencyKeys.created_at,
    }).from(idempotencyKeys)
      .where(eq(idempotencyKeys.idempotency_key, key))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];

    if (row.status === 'completed' || row.status === 'failed') {
      return { status: row.status, response_status: row.response_status, response_body: row.response_body };
    }

    const elapsedMs = Date.now() - startMs;
    if (elapsedMs > 10_000) {
      const stealResult = await db.update(idempotencyKeys)
        .set({ status: 'failed' })
        .where(and(
          eq(idempotencyKeys.idempotency_key, key),
          eq(idempotencyKeys.status, 'processing'),
          lte(idempotencyKeys.created_at, new Date(Date.now() - 10_000)),
        ));
      if ((stealResult as { rowCount?: number } | undefined)?.rowCount === 1) {
        return { status: 'failed', response_status: null, response_body: null };
      }
    }
  }

  const rows = await db.select({
    status: idempotencyKeys.status,
    response_status: idempotencyKeys.response_status,
    response_body: idempotencyKeys.response_body,
  }).from(idempotencyKeys)
    .where(eq(idempotencyKeys.idempotency_key, key))
    .limit(1);

  if (rows.length > 0 && (rows[0].status === 'completed' || rows[0].status === 'failed')) {
    return { status: rows[0].status, response_status: rows[0].response_status, response_body: rows[0].response_body };
  }

  return { status: 'failed', response_status: null, response_body: null };
}

const route = new Hono();

route.use('*', authMiddleware);

const idParam = z.object({ id: z.string().min(1).max(64) });

const orderItemInputSchema = z.object({
  menu_item_id: z.string().min(1).max(64),
  name: z.string().min(1).max(255),
  quantity: z.number().int().positive().max(99),
  price: z.number().nonnegative(),
  additives: z.array(z.unknown()).optional(),
  notes: z.string().max(500).optional(),
});

const createOrderSchema = z.object({
  restaurant_id: z.string().min(1).max(64),
  delivery_type: z.enum(['delivery', 'pickup']).optional(),
  payment_method: z.enum(['credit', 'debit', 'pix', 'cash', 'meal_ticket']),
  address_id: z.string().min(1).max(64).optional(),
  customer_name: z.string().min(1).max(255),
  customer_phone: z.string().max(32).optional(),
  customer_address: z.string().min(1).max(500),
  subtotal: z.number().nonnegative(),
  delivery_fee: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  total: z.number().nonnegative(),
  notes: z.string().max(500).optional(),
  estimated_time: z.string().max(64).optional(),
  items: z.array(orderItemInputSchema).min(1).max(50),
});

route.get('/', async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const rows = await db.select({
    id: orders.id,
    user_id: orders.user_id,
    restaurant_id: orders.restaurant_id,
    status: orders.status,
    delivery_type: orders.delivery_type,
    payment_method: orders.payment_method,
    address_id: orders.address_id,
    subtotal: orders.subtotal,
    delivery_fee: orders.delivery_fee,
    discount: orders.discount,
    total: orders.total,
    notes: orders.notes,
    estimated_time: orders.estimated_time,
    created_at: orders.created_at,
    updated_at: orders.updated_at,
    restaurant_name: restaurants.name,
  }).from(orders)
    .leftJoin(restaurants, eq(orders.restaurant_id, restaurants.id))
    .where(eq(orders.user_id, payload.sub))
    .orderBy(desc(orders.created_at));

  /* Coerce Postgres numeric(string) → number so frontend doesn't
     need to handle string-precision values on every consumer page */
  const coerced = rows.map((r) => ({
    ...r,
    subtotal: Number(r.subtotal),
    delivery_fee: r.delivery_fee !== null ? Number(r.delivery_fee) : null,
    discount: r.discount !== null ? Number(r.discount) : null,
    total: Number(r.total),
  }));

  return c.json(coerced);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);
  const { id } = c.req.valid('param');

  const orderRows = await db.select({
    id: orders.id,
    user_id: orders.user_id,
    restaurant_id: orders.restaurant_id,
    status: orders.status,
    delivery_type: orders.delivery_type,
    payment_method: orders.payment_method,
    address_id: orders.address_id,
    subtotal: orders.subtotal,
    delivery_fee: orders.delivery_fee,
    discount: orders.discount,
    total: orders.total,
    notes: orders.notes,
    estimated_time: orders.estimated_time,
    created_at: orders.created_at,
    updated_at: orders.updated_at,
    restaurant_name: restaurants.name,
    restaurant_image: restaurants.image_url,
  }).from(orders)
    .leftJoin(restaurants, eq(orders.restaurant_id, restaurants.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!orderRows.length) return c.json({ error: 'Pedido não encontrado' }, 404);
  const rawOrder = orderRows[0];
  if (rawOrder.user_id !== payload.sub) return c.json({ error: 'Acesso negado' }, 403);

  const rawItems = await db.select().from(orderItems).where(eq(orderItems.order_id, id));

  let address: { street: string; number: string; neighborhood: string | null; city: string; state: string; zip_code: string | null } | null = null;
  if (rawOrder.address_id) {
    const addrRows = await db.select({
      street: addresses.street,
      number: addresses.number,
      neighborhood: addresses.neighborhood,
      city: addresses.city,
      state: addresses.state,
      zip_code: addresses.zip_code,
    }).from(addresses).where(eq(addresses.id, rawOrder.address_id)).limit(1);
    if (addrRows.length) address = addrRows[0];
  }

  const userRows = await db.select({ name: users.name, phone: users.phone })
    .from(users).where(eq(users.id, rawOrder.user_id)).limit(1);
  const customer = userRows[0] ?? null;

  /* Coerce Postgres numeric(string) → number */
  const order = {
    ...rawOrder,
    subtotal: Number(rawOrder.subtotal),
    delivery_fee: rawOrder.delivery_fee !== null ? Number(rawOrder.delivery_fee) : null,
    discount: rawOrder.discount !== null ? Number(rawOrder.discount) : null,
    total: Number(rawOrder.total),
  };
  const items = rawItems.map((it) => ({
    ...it,
    price: Number(it.price),
  }));

  return c.json({ order, items, address, customer });
});

route.post('/', zValidator('json', createOrderSchema), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);
  const input = c.req.valid('json');

  const idempotencyKey = c.req.header('Idempotency-Key');

  if (idempotencyKey) {
    try {
      await db.insert(idempotencyKeys).values({
        idempotency_key: idempotencyKey,
        endpoint: 'POST /me/orders',
        user_id: payload.sub,
        status: 'processing',
        expires_at: new Date(Date.now() + 86_400_000),
      });
    } catch {
      const pollResult = await pollIdempotencyResult(idempotencyKey);
      if (pollResult && pollResult.status === 'completed' && pollResult.response_status !== null) {
        return c.json(pollResult.response_body as Record<string, unknown>, pollResult.response_status as 200 | 201 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500);
      }
      return c.json({ error: 'Requisição duplicada processada com falha', idempotency_key: idempotencyKey }, 409);
    }
  }

  try {
    const result = await createConsumerOrderWithMirror(payload.sub, input, idempotencyKey);
    const responseBody = {
      id: result.order.id,
      status: result.order.status,
      total: result.order.total,
      restaurant_id: result.order.restaurant_id,
      created_at: result.order.created_at,
      items: result.items.map((it) => ({
        id: it.id,
        name: it.name,
        quantity: it.quantity,
        price: it.price,
      })),
    };

    const branchId = result.mirror.branch_id;
    const merchantUsers = await db.select({ id: users.id }).from(users)
      .where(and(eq(users.branch_id, branchId), eq(users.role, 'merchant')));
    for (const mu of merchantUsers) {
      const subs = await db.select({ endpoint: pushSubscriptions.endpoint, keys: pushSubscriptions.keys })
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.user_id, mu.id));
      for (const sub of subs) {
        void sendPush(
          { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
          { title: 'Flux Delivery', body: 'Novo pedido recebido.', data: { orderId: result.order.id, status: 'new' } },
        );
      }
    }

    return c.json(responseBody, 201);
  } catch (err) {
    if (idempotencyKey) {
      await db.update(idempotencyKeys)
        .set({ status: 'failed' })
        .where(eq(idempotencyKeys.idempotency_key, idempotencyKey))
        .catch(() => {});
    }
    if (err instanceof MirrorServiceError) {
      const status = err.code === 'USER_NOT_FOUND' || err.code === 'BRANCH_NOT_FOUND' ? 404 : 400;
      return c.json({ error: err.message, code: err.code }, status);
    }
    logger.error('Failed to create consumer order', err instanceof Error ? err : new Error(String(err)));
    return c.json({ error: 'Erro interno ao criar pedido' }, 500);
  }
});

export default route;
