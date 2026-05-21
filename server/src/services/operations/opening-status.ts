import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../../db';
import {
  businessHours, businessHourPeriods,
  holidayOverrides, holidayOverridePeriods,
  specialDates, specialDatePeriods,
  holidayRules,
} from '../../db/schema/operations';

type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const TZ = 'America/Sao_Paulo';

function getNow(): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const parts = formatter.formatToParts(new Date());
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '0';
  return new Date(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`);
}

function toWeekDay(date: Date): WeekDay {
  const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function currentMinutes(): number {
  const now = getNow();
  return now.getHours() * 60 + now.getMinutes();
}

function isOvernight(openTime: string, closeTime: string): boolean {
  return toMinutes(closeTime) <= toMinutes(openTime);
}

export interface TimePeriod {
  openTime: string;
  closeTime: string;
}

export interface OpenStatus {
  isOpen: boolean;
  currentPeriod: TimePeriod | null;
  nextOpening: TimePeriod | null;
  nextOpeningDate: string | null;
  reason: 'open' | 'closed' | 'holiday' | 'special_closed' | 'before_hours' | 'after_hours';
  overrideLabel: string | null;
}

interface BusinessHourRow {
  weekday: WeekDay;
  isClosed: boolean;
  is24h: boolean;
  periods: TimePeriod[];
}

interface HolidayOverrideRow {
  overrideType: 'closed' | 'open_normal' | 'custom_hours';
  periods: TimePeriod[];
  holidayName: string | null;
}

interface SpecialDateRow {
  isClosed: boolean;
  is24h: boolean;
  periods: TimePeriod[];
  label: string | null;
}

async function getBusinessHours(branchId: string): Promise<BusinessHourRow[]> {
  const hours = await db
    .select({
      id: businessHours.id,
      weekday: businessHours.weekday,
      is_closed: businessHours.is_closed,
      is_24h: businessHours.is_24h,
    })
    .from(businessHours)
    .where(eq(businessHours.branch_id, branchId));

  if (hours.length === 0) return [];

  const hourIds = hours.map(h => h.id);
  const allPeriods = await db
    .select({
      business_hour_id: businessHourPeriods.business_hour_id,
      openTime: businessHourPeriods.open_time,
      closeTime: businessHourPeriods.close_time,
      sort_order: businessHourPeriods.sort_order,
    })
    .from(businessHourPeriods)
    .where(inArray(businessHourPeriods.business_hour_id, hourIds))
    .orderBy(businessHourPeriods.sort_order);

  const periodsByHourId: Record<string, TimePeriod[]> = {};
  for (const p of allPeriods) {
    const hourId = p.business_hour_id;
    (periodsByHourId[hourId] ??= []).push({ openTime: p.openTime, closeTime: p.closeTime });
  }

  return hours.map(hour => ({
    weekday: hour.weekday,
    isClosed: hour.is_closed ?? false,
    is24h: hour.is_24h ?? false,
    periods: periodsByHourId[hour.id] ?? [],
  }));
}

async function getHolidayOverride(branchId: string, dateStr: string): Promise<HolidayOverrideRow | null> {
  const overrides = await db
    .select({
      id: holidayOverrides.id,
      overrideType: holidayOverrides.override_type,
      holidayRuleId: holidayOverrides.holiday_rule_id,
    })
    .from(holidayOverrides)
    .where(and(eq(holidayOverrides.branch_id, branchId), eq(holidayOverrides.custom_date, dateStr)));

  if (overrides.length === 0) return null;

  const override = overrides[0];
  let holidayName: string | null = null;

  if (override.holidayRuleId) {
    const rules = await db
      .select({ name: holidayRules.name })
      .from(holidayRules)
      .where(eq(holidayRules.id, override.holidayRuleId));
    holidayName = rules[0]?.name ?? null;
  }

  if (override.overrideType === 'closed') {
    return { overrideType: 'closed', periods: [], holidayName };
  }

  if (override.overrideType === 'custom_hours') {
    const periods = await db
      .select({
        openTime: holidayOverridePeriods.open_time,
        closeTime: holidayOverridePeriods.close_time,
      })
      .from(holidayOverridePeriods)
      .where(eq(holidayOverridePeriods.holiday_override_id, override.id))
      .orderBy(holidayOverridePeriods.sort_order);

    return {
      overrideType: 'custom_hours',
      periods: periods.map((p: { openTime: string; closeTime: string }) => ({ openTime: p.openTime, closeTime: p.closeTime })),
      holidayName,
    };
  }

  return { overrideType: 'open_normal', periods: [], holidayName };
}

async function getSpecialDate(branchId: string, dateStr: string): Promise<SpecialDateRow | null> {
  const rows = await db
    .select({
      id: specialDates.id,
      is_closed: specialDates.is_closed,
      is_24h: specialDates.is_24h,
      label: specialDates.label,
    })
    .from(specialDates)
    .where(and(eq(specialDates.branch_id, branchId), eq(specialDates.date, dateStr)));

  if (rows.length === 0) return null;

  const row = rows[0];
  const periods = await db
    .select({
      openTime: specialDatePeriods.open_time,
      closeTime: specialDatePeriods.close_time,
    })
    .from(specialDatePeriods)
    .where(eq(specialDatePeriods.special_date_id, row.id))
    .orderBy(specialDatePeriods.sort_order);

  return {
    isClosed: row.is_closed ?? false,
    is24h: row.is_24h ?? false,
    periods: periods.map((p: { openTime: string; closeTime: string }) => ({ openTime: p.openTime, closeTime: p.closeTime })),
    label: row.label,
  };
}

function checkPeriods(periods: TimePeriod[], nowMin: number): { inPeriod: TimePeriod | null; nextPeriod: TimePeriod | null } {
  let inPeriod: TimePeriod | null = null;
  let nextPeriod: TimePeriod | null = null;

  for (const period of periods) {
    const openMin = toMinutes(period.openTime);
    const closeMin = toMinutes(period.closeTime);

    if (isOvernight(period.openTime, period.closeTime)) {
      if (nowMin >= openMin) {
        inPeriod = period;
      } else if (!nextPeriod && openMin > nowMin) {
        nextPeriod = period;
      }
    } else {
      if (nowMin >= openMin && nowMin < closeMin) {
        inPeriod = period;
      } else if (!nextPeriod && openMin > nowMin) {
        nextPeriod = period;
      }
    }
  }

  return { inPeriod, nextPeriod };
}

export async function getBranchOpenStatus(branchId: string): Promise<OpenStatus> {
  const now = getNow();
  const dateStr = formatDateISO(now);
  const todayWeekday = toWeekDay(now);
  const nowMin = currentMinutes();

  const holidayOverride = await getHolidayOverride(branchId, dateStr);
  if (holidayOverride) {
    if (holidayOverride.overrideType === 'closed') {
      return {
        isOpen: false,
        currentPeriod: null,
        nextOpening: null,
        nextOpeningDate: null,
        reason: 'holiday',
        overrideLabel: holidayOverride.holidayName,
      };
    }
    if (holidayOverride.overrideType === 'custom_hours') {
      const { inPeriod, nextPeriod } = checkPeriods(holidayOverride.periods, nowMin);
      if (inPeriod) {
        return {
          isOpen: true,
          currentPeriod: inPeriod,
          nextOpening: nextPeriod,
          nextOpeningDate: null,
          reason: 'open',
          overrideLabel: holidayOverride.holidayName,
        };
      }
      return {
        isOpen: false,
        currentPeriod: null,
        nextOpening: nextPeriod,
        nextOpeningDate: null,
        reason: 'after_hours',
        overrideLabel: holidayOverride.holidayName,
      };
    }
  }

  const specialDate = await getSpecialDate(branchId, dateStr);
  if (specialDate) {
    if (specialDate.isClosed) {
      return {
        isOpen: false,
        currentPeriod: null,
        nextOpening: null,
        nextOpeningDate: null,
        reason: 'special_closed',
        overrideLabel: specialDate.label,
      };
    }
    if (specialDate.is24h) {
      return {
        isOpen: true,
        currentPeriod: { openTime: '00:00', closeTime: '24:00' },
        nextOpening: null,
        nextOpeningDate: null,
        reason: 'open',
        overrideLabel: specialDate.label,
      };
    }
    const { inPeriod, nextPeriod } = checkPeriods(specialDate.periods, nowMin);
    if (inPeriod) {
      return {
        isOpen: true,
        currentPeriod: inPeriod,
        nextOpening: nextPeriod,
        nextOpeningDate: null,
        reason: 'open',
        overrideLabel: specialDate.label,
      };
    }
    return {
      isOpen: false,
      currentPeriod: null,
      nextOpening: nextPeriod,
      nextOpeningDate: null,
      reason: 'after_hours',
      overrideLabel: specialDate.label,
    };
  }

  const allHours = await getBusinessHours(branchId);
  const todayHours = allHours.find((h) => h.weekday === todayWeekday);

  if (!todayHours || todayHours.isClosed) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowWeekday = toWeekDay(tomorrow);
    const tomorrowHours = allHours.find((h) => h.weekday === tomorrowWeekday);

    return {
      isOpen: false,
      currentPeriod: null,
      nextOpening: tomorrowHours && !tomorrowHours.isClosed && tomorrowHours.periods.length > 0
        ? tomorrowHours.periods[0]
        : null,
      nextOpeningDate: formatDateISO(tomorrow),
      reason: 'closed',
      overrideLabel: null,
    };
  }

  if (todayHours.is24h) {
    return {
      isOpen: true,
      currentPeriod: { openTime: '00:00', closeTime: '24:00' },
      nextOpening: null,
      nextOpeningDate: null,
      reason: 'open',
      overrideLabel: null,
    };
  }

  const { inPeriod, nextPeriod } = checkPeriods(todayHours.periods, nowMin);

  if (inPeriod) {
    return {
      isOpen: true,
      currentPeriod: inPeriod,
      nextOpening: nextPeriod,
      nextOpeningDate: null,
      reason: 'open',
      overrideLabel: null,
    };
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayWeekday = toWeekDay(yesterday);
  const yesterdayHours = allHours.find((h) => h.weekday === yesterdayWeekday);

  if (yesterdayHours && !yesterdayHours.isClosed && yesterdayHours.periods.length > 0) {
    const lastPeriod = yesterdayHours.periods[yesterdayHours.periods.length - 1];
    if (isOvernight(lastPeriod.openTime, lastPeriod.closeTime)) {
      const closeMin = toMinutes(lastPeriod.closeTime);
      if (nowMin < closeMin) {
        return {
          isOpen: true,
          currentPeriod: lastPeriod,
          nextOpening: nextPeriod,
          nextOpeningDate: null,
          reason: 'open',
          overrideLabel: null,
        };
      }
    }
  }

  if (nextPeriod) {
    return {
      isOpen: false,
      currentPeriod: null,
      nextOpening: nextPeriod,
      nextOpeningDate: null,
      reason: 'before_hours',
      overrideLabel: null,
    };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowWeekday = toWeekDay(tomorrow);
  const tomorrowHours = allHours.find((h) => h.weekday === tomorrowWeekday);

  return {
    isOpen: false,
    currentPeriod: null,
    nextOpening: tomorrowHours && !tomorrowHours.isClosed && tomorrowHours.periods.length > 0
      ? tomorrowHours.periods[0]
      : null,
    nextOpeningDate: formatDateISO(tomorrow),
    reason: 'after_hours',
    overrideLabel: null,
  };
}

export async function getTodayPeriods(branchId: string): Promise<TimePeriod[]> {
  const now = getNow();
  const dateStr = formatDateISO(now);
  const todayWeekday = toWeekDay(now);

  const holidayOverride = await getHolidayOverride(branchId, dateStr);
  if (holidayOverride) {
    if (holidayOverride.overrideType === 'closed') return [];
    if (holidayOverride.overrideType === 'custom_hours') return holidayOverride.periods;
  }

  const specialDate = await getSpecialDate(branchId, dateStr);
  if (specialDate) {
    if (specialDate.isClosed) return [];
    if (specialDate.is24h) return [{ openTime: '00:00', closeTime: '24:00' }];
    return specialDate.periods;
  }

  const allHours = await getBusinessHours(branchId);
  const todayHours = allHours.find((h) => h.weekday === todayWeekday);

  if (!todayHours || todayHours.isClosed) return [];
  if (todayHours.is24h) return [{ openTime: '00:00', closeTime: '24:00' }];
  return todayHours.periods;
}

export { getNow, toWeekDay, formatDateISO, toMinutes, currentMinutes, isOvernight, TZ };
