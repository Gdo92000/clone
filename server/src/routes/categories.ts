import { Hono } from 'hono';
import { db } from '../db';
import { categories } from '../db/schema/core/categories';

const route = new Hono();

route.get('/', async (c) => {
  const all = await db.select().from(categories).orderBy(categories.name);
  return c.json(all);
});

export default route;
