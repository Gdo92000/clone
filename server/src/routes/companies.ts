import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { companies, branches } from '../db/schema';

const route = new Hono();

const idParam = z.object({ id: z.string().min(1).max(64) });

route.get('/', async (c) => {
  const all = await db.select().from(companies);
  return c.json(all);
});

route.get('/:id/branches', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const companyBranches = await db.select().from(branches).where(eq(branches.company_id, id));
  return c.json(companyBranches);
});

export default route;
