import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { merchantOrders, subscriptions, plans, branches, users } from '../db/schema';

export interface FinancePeriod {
  year: number;
  month: number;
}

export interface FinanceSummary {
  period: FinancePeriod;
  grossRevenue: number;
  platformFee: number;
  deliveryCost: number;
  netRevenue: number;
  paidOrders: number;
  totalOrders: number;
  rejectedOrders: number;
  paymentMethods: Record<string, number>;
  deliveryTypes: Record<string, number>;
}

interface OrderRow {
  total: string | null;
  status: string | null;
  payment_method: string | null;
  delivery_type: string | null;
}

const DEFAULT_PLATFORM_FEE_RATE = 0.12;
const DEFAULT_DELIVERY_FEE = 5.0;


export function computeFinanceSummary(
  allOrders: OrderRow[],
  period: FinancePeriod,
  platformFeeRate: number,
  deliveryFeePerOrder: number,
): FinanceSummary {
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

export interface GetFinanceSummaryInput {
  userId: string;
  role: string;
  companyId: string;
  period: FinancePeriod;
}

export async function getFinanceSummary(input: GetFinanceSummaryInput): Promise<FinanceSummary | null> {
  const userRows = await db.select({ company_id: users.company_id, branch_id: users.branch_id })
    .from(users).where(eq(users.id, input.userId)).limit(1);
  if (!userRows.length) return null;
  const user = userRows[0];

  const planRows = await db.select({
    platform_fee_rate: plans.platform_fee_rate,
    delivery_fee_per_order: plans.delivery_fee_per_order,
  }).from(subscriptions).innerJoin(plans, eq(plans.id, subscriptions.plan_id))
    .where(eq(subscriptions.company_id, input.companyId)).limit(1);

  const planRow = planRows.at(0);
  const platformFeeRate = planRow ? Number(planRow.platform_fee_rate) : DEFAULT_PLATFORM_FEE_RATE;
  const deliveryFeePerOrder = planRow ? Number(planRow.delivery_fee_per_order) : DEFAULT_DELIVERY_FEE;

  const selectFields = {
    total: merchantOrders.total,
    status: merchantOrders.status,
    payment_method: merchantOrders.payment_method,
    delivery_type: merchantOrders.delivery_type,
  } as const;

  let allOrders: OrderRow[] = [];

  if (input.role === 'superadmin') {
    allOrders = await db.select(selectFields).from(merchantOrders);
  } else if (input.role === 'merchant' && user.branch_id) {
    allOrders = await db.select(selectFields).from(merchantOrders)
      .where(eq(merchantOrders.branch_id, user.branch_id));
  } else if ((input.role === 'admin' || input.role === 'company_owner') && user.company_id) {
    const companyBranches = await db.select({ id: branches.id }).from(branches)
      .where(eq(branches.company_id, user.company_id));
    const branchIds: string[] = companyBranches.map((b) => b.id);
    if (branchIds.length > 0) {
      allOrders = await db.select(selectFields).from(merchantOrders)
        .where(inArray(merchantOrders.branch_id, branchIds));
    }
  }

  return computeFinanceSummary(allOrders, input.period, platformFeeRate, deliveryFeePerOrder);
}
