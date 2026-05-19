import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { desc, eq, and } from 'drizzle-orm';
import { db } from '../db';
import { userNotifications } from '../db/schema';

const route = new Hono();

route.get('/', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string } | undefined;
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);
  const items = await db.select()
    .from(userNotifications)
    .where(eq(userNotifications.user_id, payload.sub))
    .orderBy(desc(userNotifications.created_at));
  return c.json(items);
});

route.put('/:id/read', zValidator('param', z.object({ id: z.string().min(1) })), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string } | undefined;
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);
  const { id } = c.req.valid('param');
  const result = await db.update(userNotifications)
    .set({ read: true, read_at: new Date() })
    .where(and(eq(userNotifications.id, id), eq(userNotifications.user_id, payload.sub)));
  if (result.length === 0) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

route.put('/read-all', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string } | undefined;
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);
  await db.update(userNotifications)
    .set({ read: true, read_at: new Date() })
    .where(and(eq(userNotifications.user_id, payload.sub), eq(userNotifications.read, false)));
  return c.json({ success: true });
});

export default route;
