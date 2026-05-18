import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { businessHours, businessHourPeriods } from '../db/schema/operations';
import { holidayOverrides, holidayOverridePeriods } from '../db/schema/operations';
import { specialDates, specialDatePeriods } from '../db/schema/operations';
import { getBranchOpenStatus, getTodayPeriods } from '../services/operations';
import {
  weeklyHoursSchema,
  holidayOverrideSchema,
  specialDateSchema,
} from '../../../shared/validations/operations';

const branchIdParam = z.object({ branchId: z.string().min(1).max(64) });
const overrideIdParam = z.object({ branchId: z.string().min(1).max(64), id: z.string().min(1).max(64) });
const specialDateIdParam = z.object({ branchId: z.string().min(1).max(64), id: z.string().min(1).max(64) });

const operations = new Hono();

operations.get('/:branchId/status', zValidator('param', branchIdParam), async (c) => {
  const { branchId } = c.req.valid('param');
  const status = await getBranchOpenStatus(branchId);
  return c.json(status);
});

operations.get('/:branchId/today-periods', zValidator('param', branchIdParam), async (c) => {
  const { branchId } = c.req.valid('param');
  const periods = await getTodayPeriods(branchId);
  return c.json(periods);
});

operations.get('/:branchId/hours', zValidator('param', branchIdParam), async (c) => {
  const { branchId } = c.req.valid('param');
  const hours = await db
    .select()
    .from(businessHours)
    .where(eq(businessHours.branch_id, branchId));

  const result = [];
  for (const hour of hours) {
    const periods = await db
      .select()
      .from(businessHourPeriods)
      .where(eq(businessHourPeriods.business_hour_id, hour.id))
      .orderBy(businessHourPeriods.sort_order);
    result.push({ ...hour, periods });
  }

  return c.json(result);
});

operations.put('/:branchId/hours', zValidator('param', branchIdParam), zValidator('json', weeklyHoursSchema), async (c) => {
  const { branchId } = c.req.valid('param');
  const { hours } = c.req.valid('json');

  const existing = await db
    .select({ id: businessHours.id })
    .from(businessHours)
    .where(eq(businessHours.branch_id, branchId));

  for (const row of existing) {
    await db.delete(businessHourPeriods).where(eq(businessHourPeriods.business_hour_id, row.id));
    await db.delete(businessHours).where(eq(businessHours.id, row.id));
  }

  for (const hour of hours) {
    const hourId = crypto.randomUUID();
    await db.insert(businessHours).values({
      id: hourId,
      branch_id: branchId,
      weekday: hour.weekday,
      is_closed: hour.isClosed,
      is_24h: hour.is24h,
      sort_order: hour.sortOrder,
    });

    for (const period of hour.periods) {
      await db.insert(businessHourPeriods).values({
        id: crypto.randomUUID(),
        business_hour_id: hourId,
        open_time: period.openTime,
        close_time: period.closeTime,
        sort_order: period.sortOrder,
      });
    }
  }

  return c.json({ success: true, branchId });
});

operations.get('/:branchId/holiday-overrides', zValidator('param', branchIdParam), async (c) => {
  const { branchId } = c.req.valid('param');
  const overrides = await db
    .select()
    .from(holidayOverrides)
    .where(eq(holidayOverrides.branch_id, branchId));

  const result = [];
  for (const override of overrides) {
    const periods = await db
      .select()
      .from(holidayOverridePeriods)
      .where(eq(holidayOverridePeriods.holiday_override_id, override.id))
      .orderBy(holidayOverridePeriods.sort_order);
    result.push({ ...override, periods });
  }

  return c.json(result);
});

operations.post('/:branchId/holiday-overrides', zValidator('param', branchIdParam), zValidator('json', holidayOverrideSchema), async (c) => {
  const { branchId } = c.req.valid('param');
  const data = c.req.valid('json');

  const overrideId = crypto.randomUUID();
  await db.insert(holidayOverrides).values({
    id: overrideId,
    branch_id: branchId,
    holiday_rule_id: data.holidayRuleId ?? null,
    override_type: data.overrideType,
    custom_date: data.customDate,
  });

  for (const period of data.periods) {
    await db.insert(holidayOverridePeriods).values({
      id: crypto.randomUUID(),
      holiday_override_id: overrideId,
      open_time: period.openTime,
      close_time: period.closeTime,
      sort_order: period.sortOrder,
    });
  }

  return c.json({ success: true, id: overrideId }, 201);
});

operations.delete('/:branchId/holiday-overrides/:id', zValidator('param', overrideIdParam), async (c) => {
  const { id } = c.req.valid('param');
  await db.delete(holidayOverridePeriods).where(eq(holidayOverridePeriods.holiday_override_id, id));
  await db.delete(holidayOverrides).where(eq(holidayOverrides.id, id));
  return c.json({ success: true });
});

operations.get('/:branchId/special-dates', zValidator('param', branchIdParam), async (c) => {
  const { branchId } = c.req.valid('param');
  const dates = await db
    .select()
    .from(specialDates)
    .where(eq(specialDates.branch_id, branchId));

  const result = [];
  for (const date of dates) {
    const periods = await db
      .select()
      .from(specialDatePeriods)
      .where(eq(specialDatePeriods.special_date_id, date.id))
      .orderBy(specialDatePeriods.sort_order);
    result.push({ ...date, periods });
  }

  return c.json(result);
});

operations.post('/:branchId/special-dates', zValidator('param', branchIdParam), zValidator('json', specialDateSchema), async (c) => {
  const { branchId } = c.req.valid('param');
  const data = c.req.valid('json');

  const specialDateId = crypto.randomUUID();
  await db.insert(specialDates).values({
    id: specialDateId,
    branch_id: branchId,
    date: data.date,
    label: data.label ?? null,
    is_closed: data.isClosed,
    is_24h: data.is24h,
  });

  for (const period of data.periods) {
    await db.insert(specialDatePeriods).values({
      id: crypto.randomUUID(),
      special_date_id: specialDateId,
      open_time: period.openTime,
      close_time: period.closeTime,
      sort_order: period.sortOrder,
    });
  }

  return c.json({ success: true, id: specialDateId }, 201);
});

operations.delete('/:branchId/special-dates/:id', zValidator('param', specialDateIdParam), async (c) => {
  const { id } = c.req.valid('param');
  await db.delete(specialDatePeriods).where(eq(specialDatePeriods.special_date_id, id));
  await db.delete(specialDates).where(eq(specialDates.id, id));
  return c.json({ success: true });
});

export default operations;
