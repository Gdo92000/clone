import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { merchantCoupons, users, branches } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { requireTenantOwnership } from '../middleware/tenant';
import type { TokenPayload } from '../auth/types';

const route = new Hono();

route.use('*', authMiddleware, requirePermission(['superadmin', 'admin', 'merchant']));

const idParam = z.object({ id: z.string().min(1).max(64) });

const datetimeField = z.iso.datetime();
const createSchema = z.object({
  branch_id: z.string().min(1),
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.string(),
  min_order: z.string().optional(),
  max_uses: z.number().int().optional(),
  valid_until: datetimeField,
});

const updateSchema = createSchema.partial();

route.get('/', async (c) => {
  const payload = c.get('jwtPayload') as TokenPayload;
  const branchId = c.req.query('branch_id');

  if (payload.role === 'superadmin') {
    if (branchId) {
      return c.json(await db.select().from(merchantCoupons).where(eq(merchantCoupons.branch_id, branchId)));
    }
    return c.json(await db.select().from(merchantCoupons));
  }

  const user = await db.select({ company_id: users.company_id, branch_id: users.branch_id }).from(users).where(eq(users.id, payload.sub)).limit(1);
  const userData = user[0];

  if (payload.role === 'admin') {
    if (branchId) {
       const branch = await db.select().from(branches).where(eq(branches.id, branchId)).limit(1);
       if (!branch.length || branch[0].company_id !== userData.company_id) return c.json({ error: 'Forbidden' }, 403);
       return c.json(await db.select().from(merchantCoupons).where(eq(merchantCoupons.branch_id, branchId)));
    }
    const companyBranches = await db.select({ id: branches.id }).from(branches).where(eq(branches.company_id, userData.company_id));
    const branchIds = companyBranches.map(b => b.id);
    return c.json(await db.select().from(merchantCoupons).where(inArray(merchantCoupons.branch_id, branchIds)));
  } else {
    return c.json(await db.select().from(merchantCoupons).where(eq(merchantCoupons.branch_id, userData.branch_id)));
  }
});

route.get('/:id', requireTenantOwnership('branchId'), zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(merchantCoupons).where(eq(merchantCoupons.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

route.post('/', zValidator('json', createSchema), async (c) => {
  const payload = c.get('jwtPayload') as TokenPayload;
  const data = c.req.valid('json');

  if (payload.role !== 'superadmin') {
    const user = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    const userData = user[0];
    if (userData.role === 'merchant' && data.branch_id !== userData.branch_id) {
       return c.json({ error: 'Cannot create coupon for another branch' }, 403);
    }
    if (userData.role === 'admin') {
       const branch = await db.select().from(branches).where(eq(branches.id, data.branch_id)).limit(1);
       if (!branch.length || branch[0].company_id !== userData.company_id) {
         return c.json({ error: 'Cannot create coupon for a branch outside your company' }, 403);
       }
    }
  }

  const id = crypto.randomUUID();
  await db.insert(merchantCoupons).values({
    id,
    branch_id: data.branch_id,
    code: data.code,
    description: data.description ?? null,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_order: data.min_order ?? null,
    max_uses: data.max_uses ?? null,
    current_uses: 0,
    valid_until: new Date(data.valid_until),
    is_active: true,
    created_at: new Date(),
  });
  return c.json({ success: true, id }, 201);
});

route.put('/:id', requireTenantOwnership('branchId'), zValidator('param', idParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(merchantCoupons).where(eq(merchantCoupons.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(merchantCoupons).set({
    ...(data.branch_id !== undefined && { branch_id: data.branch_id }),
    ...(data.code !== undefined && { code: data.code }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.discount_type !== undefined && { discount_type: data.discount_type }),
    ...(data.discount_value !== undefined && { discount_value: data.discount_value }),
    ...(data.min_order !== undefined && { min_order: data.min_order }),
    ...(data.max_uses !== undefined && { max_uses: data.max_uses }),
    ...(data.valid_until !== undefined && { valid_until: new Date(data.valid_until) }),
  }).where(eq(merchantCoupons.id, id));
  return c.json({ success: true });
});

route.delete('/:id', requireTenantOwnership('branchId'), zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const existing = await db.select().from(merchantCoupons).where(eq(merchantCoupons.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(merchantCoupons).set({ is_active: false }).where(eq(merchantCoupons.id, id));
  return c.json({ success: true });
});

export default route;
