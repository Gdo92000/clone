import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission(['superadmin']));

const idParam = z.object({ id: z.string().min(1).max(64) });

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['customer', 'merchant', 'courier', 'admin', 'superadmin']).optional(),
  is_active: z.boolean().optional(),
  company_id: z.string().optional(),
  branch_id: z.string().optional(),
});

route.get('/', async (c) => {
  const all = await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, is_active: users.is_active, company_id: users.company_id, branch_id: users.branch_id, created_at: users.created_at }).from(users);
  return c.json(all);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  const user = (({ password_hash: _pw, ...rest }) => rest)(item[0]);
  return c.json(user);
});

route.put('/:id', zValidator('param', idParam), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Not found' }, 404);
  await db.update(users).set({ ...data, updated_at: new Date() }).where(eq(users.id, id));
  return c.json({ success: true });
});

export default route;
