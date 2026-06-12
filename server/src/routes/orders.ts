import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { tenantIsolationMiddleware } from '../lib/tenant';
import { getTokenPayload } from '../middleware/auth';
import { getOrders, updateOrderStatus } from '../services/orderService';

const route = new Hono();

route.use('*', tenantIsolationMiddleware());

const idParam = z.object({ id: z.string().min(1).max(64) });

const merchantStatusEnum = z.enum(['new', 'accepted', 'preparing', 'ready', 'dispatched', 'delivered', 'rejected']);

const statusSchema = z.object({
  status: merchantStatusEnum,
});

route.get('/', async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const result = await getOrders(payload);
  if (result === null) return c.json({ error: 'Usuário não encontrado' }, 404);

  return c.json(result);
});

route.post('/:id/status', zValidator('param', idParam), zValidator('json', statusSchema), async (c) => {
  const { id } = c.req.valid('param');
  const { status } = c.req.valid('json');
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const result = await updateOrderStatus({
    orderId: id,
    status,
    userId: payload.sub,
    role: payload.role,
    companyId: payload.company_id ?? undefined,
  });

  if (!result.success) {
    return c.json({ error: result.error }, (result.statusCode ?? 500) as 400 | 401 | 403 | 404);
  }

  return c.json({ success: true });
});

export default route;
