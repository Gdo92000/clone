import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { merchantOrders, subscriptions, plans, branches, users } from '../db/schema';
import { tenantIsolationMiddleware } from '../lib/tenant';
import { getTokenPayload } from '../middleware/auth';

import type { AppVariables } from '../types/hono';

const route = new Hono<{ Variables: AppVariables }>();

route.use('*', tenantIsolationMiddleware());

const summarySchema = z.object({
year: z.coerce.number().int().min(2024).max(2099).default(() => new Date().getFullYear()),
month: z.coerce.number().int().min(1).max(12).default(() => new Date().getMonth() + 1),
});

const DEFAULT_PLATFORM_FEE_RATE = 0.12;
const DEFAULT_DELIVERY_FEE = 5.0;

function computeFinanceSummary(allOrders: Array<{ total: string | null; status: string | null; payment_method: string | null; delivery_type: string | null }>, period: { year: number; month: number }, platformFeeRate: number, deliveryFeePerOrder: number) {
  const periodOrders = allOrders.filter((o) => o.status !== 'rejected');
  const paidOrders = periodOrders.filter((o) => o.status === 'delivered');
  const grossRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const platformFee = grossRevenue * platformFeeRate;
  const deliveryCost = periodOrders.filter((o) => o.delivery_type === 'delivery').length * deliveryFeePerOrder;
  const netRevenue = grossRevenue - platformFee - deliveryCost;

  const paymentMethods: Record<string, number> = {};
  for (const o of periodOrders) {
    const val = typeof o.payment_method === 'string' ? o.payment_method : 'unknown';
    paymentMethods[val] = (paymentMethods[val] ?? 0) + 1;
  }
  const deliveryTypes: Record<string, number> = {};
  for (const o of periodOrders) {
    const val = typeof o.delivery_type === 'string' ? o.delivery_type : 'unknown';
    deliveryTypes[val] = (deliveryTypes[val] ?? 0) + 1;
  }

  return {
    period,
    grossRevenue,
    platformFee,
    deliveryCost,
    netRevenue,
    paidOrders: paidOrders.length,
    totalOrders: allOrders.length,
    rejectedOrders: allOrders.filter((o) => o.status === 'rejected').length,
    paymentMethods,
    deliveryTypes,
  };
}

route.get('/summary', zValidator('query', summarySchema), async (c) => {
const { year, month } = c.req.valid('query');
const payload = getTokenPayload(c);
if (!payload) return c.json({ error: 'Não autenticado' }, 401);

const user = await db.select({ company_id: users.company_id, branch_id: users.branch_id }).from(users).where(eq(users.id, payload.sub)).limit(1);
if (user.length === 0) return c.json({ error: 'Usuário não encontrado' }, 404);

const companyId = c.get('tenantId');
const planRows = await db.select({
platform_fee_rate: plans.platform_fee_rate,
delivery_fee_per_order: plans.delivery_fee_per_order,
}).from(subscriptions).innerJoin(plans, eq(plans.id, subscriptions.plan_id)).where(eq(subscriptions.company_id, companyId)).limit(1);

const planRow = planRows.at(0);
const platformFeeRate = planRow ? Number(planRow.platform_fee_rate) : DEFAULT_PLATFORM_FEE_RATE;
const deliveryFeePerOrder = planRow ? Number(planRow.delivery_fee_per_order) : DEFAULT_DELIVERY_FEE;

const period = { year, month };

if (payload.role === 'superadmin') {
  const allOrders = await db.select({
    total: merchantOrders.total,
    status: merchantOrders.status,
    payment_method: merchantOrders.payment_method,
    delivery_type: merchantOrders.delivery_type,
  }).from(merchantOrders);
  return c.json(computeFinanceSummary(allOrders, period, platformFeeRate, deliveryFeePerOrder));
}

if (payload.role === 'merchant' && user[0].branch_id) {
  const allOrders = await db.select({
    total: merchantOrders.total,
    status: merchantOrders.status,
    payment_method: merchantOrders.payment_method,
    delivery_type: merchantOrders.delivery_type,
  }).from(merchantOrders).where(eq(merchantOrders.branch_id, user[0].branch_id));
  return c.json(computeFinanceSummary(allOrders, period, platformFeeRate, deliveryFeePerOrder));
}

if ((payload.role === 'admin' || payload.role === 'company_owner') && user[0].company_id) {
  const companyBranches = await db.select({ id: branches.id }).from(branches).where(eq(branches.company_id, user[0].company_id));
  const branchIds: string[] = companyBranches.map(b => b.id);
  if (branchIds.length === 0) {
    return c.json({ period, grossRevenue: 0, platformFee: 0, deliveryCost: 0, netRevenue: 0, paidOrders: 0, totalOrders: 0, rejectedOrders: 0, paymentMethods: {}, deliveryTypes: {} });
  }
  const allOrders = await db.select({
    total: merchantOrders.total,
    status: merchantOrders.status,
    payment_method: merchantOrders.payment_method,
    delivery_type: merchantOrders.delivery_type,
  }).from(merchantOrders).where(inArray(merchantOrders.branch_id, branchIds));
  return c.json(computeFinanceSummary(allOrders, period, platformFeeRate, deliveryFeePerOrder));
}

return c.json({ period, grossRevenue: 0, platformFee: 0, deliveryCost: 0, netRevenue: 0, paidOrders: 0, totalOrders: 0, rejectedOrders: 0, paymentMethods: {}, deliveryTypes: {} });
});

export default route;
