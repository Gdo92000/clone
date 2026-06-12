import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { tenantIsolationMiddleware } from '../lib/tenant';
import { getTokenPayload } from '../middleware/auth';
import { getDashboardAnalytics } from '../services/analyticsService';

const route = new Hono();

route.use('*', tenantIsolationMiddleware());

const dateRangeSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

route.get('/dashboard', zValidator('query', dateRangeSchema), async (c) => {
  const { days } = c.req.valid('query');
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const result = await getDashboardAnalytics({
    userId: payload.sub,
    role: payload.role,
    days,
  });

  if (result === null) return c.json({ error: 'Usuário não encontrado' }, 404);

  return c.json(result);
});

export default route;
