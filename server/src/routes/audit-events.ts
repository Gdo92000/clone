import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { auditEvents } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission({ roles: ['superadmin'] }));

const idParam = z.object({ id: z.string().min(1).max(64) });

route.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const offset = (page - 1) * limit;
  const all = await db.select().from(auditEvents).orderBy(desc(auditEvents.created_at)).limit(limit).offset(offset);
  return c.json(all);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(auditEvents).where(eq(auditEvents.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

export default route;
