import { Hono } from 'hono';
import { gte, eq, inArray, and } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { merchantOrders, branches, users } from '../db/schema';
import { tenantIsolationMiddleware } from '../lib/tenant';
import { getTokenPayload } from '../middleware/auth';

const route = new Hono();

route.use('*', tenantIsolationMiddleware());

const dateRangeSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

route.get('/dashboard', zValidator('query', dateRangeSchema), async (c) => {
  const { days } = c.req.valid('query');
  const since = new Date();
  since.setDate(since.getDate() - days);
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const user = await db.select({ company_id: users.company_id, branch_id: users.branch_id }).from(users).where(eq(users.id, payload.sub)).limit(1);
  if (user.length === 0) return c.json({ error: 'Usuário não encontrado' }, 404);

  const conditions = [gte(merchantOrders.created_at, since)];

  if (payload.role === 'superadmin') {
    // Superadmin pode ver analytics de todos os tenants
  } else if (payload.role === 'merchant' && user[0].branch_id) {
    conditions.push(eq(merchantOrders.branch_id, user[0].branch_id));
  } else if (payload.role === 'admin' || payload.role === 'company_owner') {
    if (user[0].company_id) {
      const companyBranches = await db.select({ id: branches.id }).from(branches).where(eq(branches.company_id, user[0].company_id));
      const branchIds: string[] = companyBranches.map(b => b.id);
      if (branchIds.length > 0) {
        conditions.push(inArray(merchantOrders.branch_id, branchIds));
      } else {
        return c.json({ revenue: 0, avgTicket: 0, orderCount: 0, ordersByDay: [], statusBreakdown: {} });
      }
    }
  } else {
    return c.json({ revenue: 0, avgTicket: 0, orderCount: 0, ordersByDay: [], statusBreakdown: {} });
  }

  const ordersRows = await db.select({
    total: merchantOrders.total,
    status: merchantOrders.status,
    created_at: merchantOrders.created_at,
  }).from(merchantOrders)
    .where(and(...conditions));

  const revenue = ordersRows.reduce((sum, row) => sum + Number(row.total), 0);
  const orderCount = ordersRows.length;
  const avgTicket = orderCount > 0 ? revenue / orderCount : 0;

  const statusBreakdown: Record<string, number> = {};
  for (const row of ordersRows) {
    const s = row.status;
    statusBreakdown[s] = (statusBreakdown[s] ?? 0) + 1;
  }

  const dailyMap = new Map<string, number>();
  for (const row of ordersRows) {
    if (row.created_at) {
      const d = new Date(row.created_at).toISOString().slice(0, 10);
      dailyMap.set(d, (dailyMap.get(d) ?? 0) + Number(row.total));
    }
  }
  const ordersByDay = Array.from(dailyMap.entries())
    .map(([date, value]) => ({ date, revenue: value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return c.json({
    revenue,
    avgTicket,
    orderCount,
    ordersByDay,
    statusBreakdown,
  });
});

export default route;
