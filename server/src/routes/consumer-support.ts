import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { supportTickets } from '../db/schema';
import { authMiddleware, getTokenPayload } from '../middleware/auth';

const route = new Hono();

route.use('*', authMiddleware);

const createSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1),
});

route.post('/', zValidator('json', createSchema), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  await db.insert(supportTickets).values({
    id,
    user_id: payload.sub,
    title: data.title,
    message: data.message,
    created_at: new Date(),
    updated_at: new Date(),
  } as typeof supportTickets.$inferInsert);
  return c.json({ success: true, id }, 201);
});

route.get('/', async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const tickets = await db.select().from(supportTickets)
    .where(eq(supportTickets.user_id, payload.sub))
    .orderBy(desc(supportTickets.created_at));
  return c.json(tickets);
});

export default route;
