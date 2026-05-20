import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { db } from '../db';
import { orders } from '../db/schema';
import { requirePermission } from '../middleware/permission';
 
const route = new Hono();
 
route.use('*', requirePermission({ roles: ['superadmin'] }));
 
route.get('/platform-metrics', async (c) => {
  const metrics = await db.select({
    totalOrders: sql<number>`count(${orders.id})::int`,
    totalRevenue: sql<number>`coalesce(sum(${orders.total}), 0)::float`,
    avgTicket: sql<number>`coalesce(avg(${orders.total}), 0)::float`,
    activeStores: sql<number>`count(distinct ${orders.restaurant_id})::int`,
    deliveryCount: sql<number>`count(*) filter (where ${orders.delivery_type} = 'delivery')::int`,
  }).from(orders);
 
  const m = metrics[0];
  const totalOrders = m.totalOrders || 0;
  const totalRevenue = m.totalRevenue || 0;
  const deliveryPercent = totalOrders > 0 ? Math.round((m.deliveryCount / totalOrders) * 100) : 0;
 
  return c.json({
    totalOrders,
    totalRevenue,
    avgTicket: m.avgTicket || 0,
    activeStores: m.activeStores || 0,
    deliveryPercent,
    takeoutPercent: 100 - deliveryPercent,
  });
});
 
export default route;
