import type { MiddlewareHandler } from 'hono';
import { eq, sql, inArray } from 'drizzle-orm';
import { db } from '../db';
import { plans, subscriptions, branches, menuItems, campaigns, users } from '../db/schema';
import { getTokenPayload } from './auth';

type ResourceType = 'branches' | 'products' | 'campaigns';

const resourceMap: Record<ResourceType, { table: typeof branches | typeof menuItems | typeof campaigns; limitField: string }> = {
  branches: { table: branches, limitField: 'max_branches' },
  products: { table: menuItems, limitField: 'max_products' },
  campaigns: { table: campaigns, limitField: 'max_campaigns' },
};

export function requirePlanLimit(resourceType: ResourceType): MiddlewareHandler {
  return async (c, next) => {
    const payload = getTokenPayload(c);
    if (!payload) return c.json({ error: 'Não autenticado' }, 401);

    if (payload.role === 'superadmin') {
      await next();
      return;
    }

    const userRows = await db.select({ company_id: users.company_id }).from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!userRows.length) return c.json({ error: 'Usuário não encontrado' }, 404);
    const companyId = userRows[0].company_id;
    if (!companyId) return c.json({ error: 'Usuário sem empresa associada' }, 400);

    const subRows = await db.select({ plan_id: subscriptions.plan_id }).from(subscriptions).where(eq(subscriptions.company_id, companyId)).limit(1);
    if (!subRows.length) return c.json({ error: 'Assinatura não encontrada' }, 404);

    const planRows = await db.select().from(plans).where(eq(plans.id, subRows[0].plan_id)).limit(1);
    if (!planRows.length) return c.json({ error: 'Plano não encontrado' }, 404);

    const plan = planRows[0];
    const resource = resourceMap[resourceType];
    const limitField = resource.limitField as keyof typeof plans;
    const limit = Number(plan[limitField] ?? 0);

    if (limit <= 0) {
      return c.json({ error: 'Recurso não disponível no plano atual', limit: 0 }, 403);
    }

    let count: number;
    if (resourceType === 'branches') {
      const countRows = await db.select({ count: sql<number>`count(*)` }).from(resource.table).where(eq(branches.company_id, companyId));
      count = countRows[0]?.count ?? 0;
    } else if (resourceType === 'products') {
      const branchIds = await db.select({ id: branches.id }).from(branches).where(eq(branches.company_id, companyId));
      const ids = branchIds.map((b) => b.id);
      if (ids.length === 0) {
        count = 0;
      } else {
        const countRows = await db.select({ count: sql<number>`count(*)` }).from(resource.table).where(inArray(menuItems.branch_id, ids));
        count = countRows[0]?.count ?? 0;
      }
    } else {
      const countRows = await db.select({ count: sql<number>`count(*)` }).from(resource.table);
      count = countRows[0]?.count ?? 0;
    }

    if (count >= limit) {
      return c.json({ error: `Limite de ${resourceType} excedido`, limit, current: count, plan_id: plan.id }, 409);
    }

    await next();
  };
}
