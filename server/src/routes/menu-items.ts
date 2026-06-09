import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { menuItems, additives } from '../db/schema';

const route = new Hono();

const idParam = z.object({ id: z.string().min(1).max(64) });

route.get('/', async (c) => {
  const all = await db.select().from(menuItems).where(eq(menuItems.is_visible_to_consumer, true));
  const result = [];
  for (const item of all) {
    const addRows = await db.select().from(additives).where(sql`menu_item_id = ${item.id}`);
    result.push({ ...item, additives: addRows });
  }
  return c.json(result);
});

route.get('/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const rows = await db.select().from(menuItems)
    .where(and(eq(menuItems.id, id), eq(menuItems.is_visible_to_consumer, true))).limit(1);
  const item = rows.at(0);
  if (item === undefined) return c.json({ error: 'Not found' }, 404);
  const addRows = await db.select().from(additives).where(sql`menu_item_id = ${id}`);
  return c.json({ ...item, additives: addRows });
});

export default route;
