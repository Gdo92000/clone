import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { campaigns, users, branches } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { requireTenantOwnership } from '../middleware/tenant';
import { requirePlanLimit } from '../middleware/planLimits';
import type { TokenPayload } from '../auth/types';

const route = new Hono();

route.use('*', authMiddleware, requirePermission({ roles: ['superadmin', 'admin', 'merchant'] }));

const idParam = z.object({ id: z.string().min(1).max(64) });

const datetimeField = z.iso.datetime();
const createSchema = z.object({
  branch_id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  discount_percentage: z.string().optional(),
  status: z.enum(['active', 'paused', 'finished']).optional(),
  starts_at: datetimeField.optional(),
  ends_at: datetimeField.optional(),
});

const updateSchema = createSchema.partial();

route.get('/', async (c) => {
  const payload = c.get('jwtPayload') as TokenPayload;
  const branchId = c.req.query('branch_id');

  if (payload.role === 'superadmin') {
    if (branchId) {
      return c.json(await db.select().from(campaigns).where(eq(campaigns.branch_id, branchId)));
    }
    return c.json(await db.select().from(campaigns));
  }

  const user = await db.select({ company_id: users.company_id, branch_id: users.branch_id }).from(users).where(eq(users.id, payload.sub)).limit(1);

  if (payload.role === 'admin') {
    if (branchId) {
       const branch = await db.select().from(branches).where(eq(branches.id, branchId)).limit(1);
       if (!branch.length || branch[0].company_id !== user[0].company_id) return c.json({ error: 'Forbidden' }, 403);
       return c.json(await db.select().from(campaigns).where(eq(campaigns.branch_id, branchId)));
    }
    if (!user[0].company_id) return c.json({ error: 'User not linked to company' }, 500);
    const companyBranches = await db.select({ id: branches.id }).from(branches).where(eq(branches.company_id, user[0].company_id));
    const branchIds = companyBranches.map(b => b.id);
    return c.json(await db.select().from(campaigns).where(inArray(campaigns.branch_id, branchIds)));
  }

  if (!user[0].branch_id) return c.json({ error: 'User not linked to branch' }, 500);
  return c.json(await db.select().from(campaigns).where(eq(campaigns.branch_id, user[0].branch_id)));
});

route.get('/:id', requireTenantOwnership('branchId'), zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

route.post('/', requirePlanLimit('campaigns'), zValidator('json', createSchema), async (c) => {
  const payload = c.get('jwtPayload') as TokenPayload;
  const data = c.req.valid('json');
  
  if (payload.role !== 'superadmin') {
    const user = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    const userData = user[0];
    if (userData.role === 'merchant' && data.branch_id !== userData.branch_id) {
       return c.json({ error: 'Cannot create campaign for another branch' }, 403);
    }
    if (userData.role === 'admin') {
       const branch = await db.select().from(branches).where(eq(branches.id, data.branch_id)).limit(1);
       if (!branch.length || branch[0].company_id !== userData.company_id) {
         return c.json({ error: 'Cannot create campaign for a branch outside your company' }, 403);
       }
    }
  }

  const id = crypto.randomUUID();
  await db.insert(campaigns).values({
    id,
    branch_id: data.branch_id,
    name: data.name,
    description: data.description ?? null,
    discount_percentage: data.discount_percentage ?? null,
    status: data.status ?? 'active',
    starts_at: data.starts_at ? new Date(data.starts_at) : null,
    ends_at: data.ends_at ? new Date(data.ends_at) : null,
    created_at: new Date(),
  });
  return c.json({ success: true, id }, 201);
});

route.put('/:id', requireTenantOwnership('branchId'), zValidator('param', idParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(campaigns).set({
    ...(data.branch_id !== undefined && { branch_id: data.branch_id }),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.discount_percentage !== undefined && { discount_percentage: data.discount_percentage }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.starts_at !== undefined && { starts_at: data.starts_at ? new Date(data.starts_at) : null }),
    ...(data.ends_at !== undefined && { ends_at: data.ends_at ? new Date(data.ends_at) : null }),
  }).where(eq(campaigns.id, id));
  return c.json({ success: true });
});

route.delete('/:id', requireTenantOwnership('branchId'), zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const existing = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.delete(campaigns).where(eq(campaigns.id, id));
  return c.json({ success: true });
});

export default route;
