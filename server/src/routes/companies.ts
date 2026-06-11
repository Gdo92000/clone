import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { companies, branches, users } from '../db/schema';
import { requirePermission } from '../middleware/permission';
import { authMiddleware, getTokenPayload } from '../middleware/auth';

const route = new Hono();

route.use('*', authMiddleware);

const idParam = z.object({ id: z.string().min(1).max(64) });

route.get(
  '/',
  requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
async (c) => {
const payload = getTokenPayload(c);
if (!payload) return c.json({ error: 'Não autenticado' }, 401);

if (payload.role !== 'superadmin') {
  const user = await db.select({ company_id: users.company_id }).from(users).where(eq(users.id, payload.sub)).limit(1);
  if (!user.length || !user[0].company_id) return c.json({ error: 'Acesso negado' }, 403);
  const result = await db.select().from(companies).where(eq(companies.id, user[0].company_id));
  return c.json(result);
}

const result = await db.select().from(companies);
return c.json(result);
},
);

route.get('/:id/branches', requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }), zValidator('param', idParam), async (c) => {
const { id } = c.req.valid('param');
const payload = getTokenPayload(c);
if (!payload) return c.json({ error: 'Não autenticado' }, 401);

if (payload.role !== 'superadmin') {
  const user = await db.select({ company_id: users.company_id }).from(users).where(eq(users.id, payload.sub)).limit(1);
  if (!user.length || user[0].company_id !== id) {
    return c.json({ error: 'Acesso negado a esta empresa' }, 403);
  }
}

const companyBranches = await db.select().from(branches).where(eq(branches.company_id, id));
return c.json(companyBranches);
});

export default route;
