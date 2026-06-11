import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { holidayRules } from '../db/schema';
import { seedHolidaysForYear, getHolidaysForDate } from '../services/operations';
import { holidayRuleSchema } from '../../../shared/validations/operations';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const dateParam = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato AAAA-MM-DD') });
const yearParam = z.object({ year: z.coerce.number().int().min(2000).max(2100) });
const idParam = z.object({ id: z.string().min(1).max(64) });

const holidays = new Hono();

holidays.get('/', async (c) => {
  const all = await db.select().from(holidayRules);
  return c.json(all);
});

holidays.get('/date/:date', zValidator('param', dateParam), async (c) => {
  const { date } = c.req.valid('param');
  const result = await getHolidaysForDate(date);
  return c.json(result);
});

holidays.post('/seed/:year', authMiddleware, requirePermission({ roles: ['superadmin', 'admin'] }), zValidator('param', yearParam), async (c) => {
  const { year } = c.req.valid('param');
  const count = await seedHolidaysForYear(year);
  return c.json({ seeded: count, year });
});

holidays.post('/', authMiddleware, requirePermission({ roles: ['superadmin', 'admin'] }), zValidator('json', holidayRuleSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  await db.insert(holidayRules).values({
    id,
    name: data.name,
    date: data.date,
    scope: data.scope,
    state_code: data.stateCode ?? null,
    city_code: data.cityCode ?? null,
    is_recurring: data.isRecurring,
    year: data.year ?? null,
  });
  return c.json({ success: true, id }, 201);
});

holidays.delete('/:id', authMiddleware, requirePermission({ roles: ['superadmin', 'admin'] }), zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  await db.delete(holidayRules).where(eq(holidayRules.id, id));
  return c.json({ success: true });
});

export default holidays;
