import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { tenantIsolationMiddleware } from '../lib/tenant';
import { getTokenPayload } from '../middleware/auth';
import { getFinanceSummary } from '../services/financeService';

import type { AppVariables } from '../types/hono';

const route = new Hono<{ Variables: AppVariables }>();

route.use('*', tenantIsolationMiddleware());

const summarySchema = z.object({
  year: z.coerce.number().int().min(2024).max(2099).default(() => new Date().getFullYear()),
  month: z.coerce.number().int().min(1).max(12).default(() => new Date().getMonth() + 1),
});

route.get('/summary', zValidator('query', summarySchema), async (c) => {
  const { year, month } = c.req.valid('query');
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const result = await getFinanceSummary({
    userId: payload.sub,
    role: payload.role,
    companyId: c.get('tenantId'),
    period: { year, month },
  });

  if (!result) return c.json({ error: 'Usuário não encontrado' }, 404);

  return c.json(result);
});

export default route;
