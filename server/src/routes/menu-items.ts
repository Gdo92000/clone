import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { menuItems } from '../db/schema/core/menu-items';

const route = new Hono();

const idParam = z.object({ id: z.string().min(1).max(64) });

route.get('/', async (c) => {
  const all = await db.select().from(menuItems);
  return c.json(all);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const item = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Not found' }, 404);
  return c.json(item[0]);
});

export default route;
