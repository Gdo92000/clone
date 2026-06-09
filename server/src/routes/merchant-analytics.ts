import { Hono } from 'hono';
import { gte } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { merchantOrders } from '../db/schema';
import { tenantIsolationMiddleware } from '../lib/tenant';

const route = new Hono();

route.use('*', tenantIsolationMiddleware());

const dateRangeSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

route.get('/dashboard', zValidator('query', dateRangeSchema), async (c) => {
  const { days } = c.req.valid('query');
  const since = new Date();
  since.setDate(since.getDate() - days);

  const ordersRows = await db.select({
    total: merchantOrders.total,
    status: merchantOrders.status,
    created_at: merchantOrders.created_at,
  }).from(merchantOrders)
    .where(gte(merchantOrders.created_at, since));

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
