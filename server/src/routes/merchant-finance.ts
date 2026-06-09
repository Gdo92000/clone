import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { merchantOrders, subscriptions, plans } from '../db/schema';
import { tenantIsolationMiddleware } from '../lib/tenant';

const route = new Hono();

route.use('*', tenantIsolationMiddleware());

const summarySchema = z.object({
year: z.coerce.number().int().min(2024).max(2099).default(() => new Date().getFullYear()),
month: z.coerce.number().int().min(1).max(12).default(() => new Date().getMonth() + 1),
});

const DEFAULT_PLATFORM_FEE_RATE = 0.12;
const DEFAULT_DELIVERY_FEE = 5.0;

route.get('/summary', zValidator('query', summarySchema), async (c) => {
const { year, month } = c.req.valid('query');

const allOrders = await db.select({
total: merchantOrders.total,
status: merchantOrders.status,
payment_method: merchantOrders.payment_method,
delivery_type: merchantOrders.delivery_type,
}).from(merchantOrders);

const periodOrders = allOrders.filter((o) => o.status !== 'rejected');
const paidOrders = periodOrders.filter((o) => o.status === 'delivered');

const grossRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);

const companyId = c.get('tenantId');
const planRows = await db.select({
platform_fee_rate: plans.platform_fee_rate,
delivery_fee_per_order: plans.delivery_fee_per_order,
}).from(subscriptions).innerJoin(plans, eq(plans.id, subscriptions.plan_id)).where(eq(subscriptions.company_id, companyId)).limit(1);

const planRow = planRows.at(0);
const platformFeeRate = planRow ? Number(planRow.platform_fee_rate) : DEFAULT_PLATFORM_FEE_RATE;
const deliveryFeePerOrder = planRow ? Number(planRow.delivery_fee_per_order) : DEFAULT_DELIVERY_FEE;

const platformFee = grossRevenue * platformFeeRate;
const deliveryCost = periodOrders.filter((o) => o.delivery_type === 'delivery').length * deliveryFeePerOrder;
const netRevenue = grossRevenue - platformFee - deliveryCost;

return c.json({
period: { year, month },
grossRevenue,
platformFee,
deliveryCost,
netRevenue,
paidOrders: paidOrders.length,
totalOrders: allOrders.length,
rejectedOrders: allOrders.filter((o) => o.status === 'rejected').length,
paymentMethods: aggregateField(periodOrders, 'payment_method'),
deliveryTypes: aggregateField(periodOrders, 'delivery_type'),
});
});

function aggregateField(orders: Array<Record<string, unknown>>, field: string): Record<string, number> {
const result: Record<string, number> = {};
for (const o of orders) {
const val = typeof o[field] === 'string' ? o[field] : 'unknown';
result[val] = (result[val] ?? 0) + 1;
}
return result;
}

export default route;
