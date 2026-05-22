import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { desc } from 'drizzle-orm';
import { db } from '../db';
import { notifications } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission({ roles: ['superadmin', 'admin'] }));

const createSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  target: z.enum(['all', 'active', 'inactive', 'plan']),
  plan_id: z.enum(['basic', 'pro', 'premium']).optional(),
  sent_by: z.string().min(1),
});

route.get('/', async (c) => {
  const all = await db.select().from(notifications).orderBy(desc(notifications.created_at));
  return c.json(all);
});

route.post('/', zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  await db.insert(notifications).values({ ...data, id, created_at: new Date() } as typeof notifications.$inferInsert);
  return c.json({ success: true, id }, 201);
});

export default route;
