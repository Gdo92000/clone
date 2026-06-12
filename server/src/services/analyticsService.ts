import { gte, eq, inArray, and } from 'drizzle-orm';
import { db } from '../db';
import { merchantOrders, branches, users } from '../db/schema';

export interface DashboardAnalytics {
  revenue: number;
  avgTicket: number;
  orderCount: number;
  ordersByDay: Array<{ date: string; revenue: number }>;
  statusBreakdown: Record<string, number>;
}

const EMPTY_DASHBOARD: DashboardAnalytics = {
  revenue: 0,
  avgTicket: 0,
  orderCount: 0,
  ordersByDay: [],
  statusBreakdown: {},
};

export interface GetDashboardInput {
  userId: string;
  role: string;
  days: number;
}

export async function getDashboardAnalytics(input: GetDashboardInput): Promise<DashboardAnalytics | null> {
  const since = new Date();
  since.setDate(since.getDate() - input.days);

  const userRows = await db.select({ company_id: users.company_id, branch_id: users.branch_id })
    .from(users).where(eq(users.id, input.userId)).limit(1);
  if (!userRows.length) return null;
  const user = userRows[0];

  const conditions = [gte(merchantOrders.created_at, since)];

  if (input.role === 'superadmin') {
    // superadmin sees all tenants
  } else if (input.role === 'merchant' && user.branch_id) {
    conditions.push(eq(merchantOrders.branch_id, user.branch_id));
  } else if ((input.role === 'admin' || input.role === 'company_owner') && user.company_id) {
    const companyBranches = await db.select({ id: branches.id }).from(branches)
      .where(eq(branches.company_id, user.company_id));
    const branchIds: string[] = companyBranches.map((b) => b.id);
    if (branchIds.length > 0) {
      conditions.push(inArray(merchantOrders.branch_id, branchIds));
    } else {
      return EMPTY_DASHBOARD;
    }
  } else {
    return EMPTY_DASHBOARD;
  }

  const ordersRows = await db.select({
    total: merchantOrders.total,
    status: merchantOrders.status,
    created_at: merchantOrders.created_at,
  }).from(merchantOrders).where(and(...conditions));

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

  return { revenue, avgTicket, orderCount, ordersByDay, statusBreakdown };
}
