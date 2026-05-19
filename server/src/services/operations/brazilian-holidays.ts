import crypto from 'node:crypto';
import { db } from '../../db';
import { holidayRules } from '../../db/schema/operations';
import { eq, and, or, sql } from 'drizzle-orm';

const TZ = 'America/Sao_Paulo';

function getYear(): number {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const parts = formatter.formatToParts(new Date());
  return parseInt(parts.find(p => p.type === 'year')?.value ?? '2026', 10);
}

function easterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * d + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatBR(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface HolidayDef {
  name: string;
  date: string;
  scope: 'national' | 'state' | 'municipal';
  stateCode?: string;
  cityCode?: string;
  isRecurring: boolean;
  year?: number;
}

function generateNationalHolidays(year: number): HolidayDef[] {
  const easter = easterDate(year);

  return [
    { name: 'Confraternização Universal', date: `${year}-01-01`, scope: 'national', isRecurring: true },
    { name: 'Carnaval', date: formatBR(addDays(easter, -47)), scope: 'national', isRecurring: false, year },
    { name: 'Carnaval', date: formatBR(addDays(easter, -48)), scope: 'national', isRecurring: false, year },
    { name: 'Sexta-feira Santa', date: formatBR(addDays(easter, -2)), scope: 'national', isRecurring: false, year },
    { name: 'Tiradentes', date: `${year}-04-21`, scope: 'national', isRecurring: true },
    { name: 'Dia do Trabalhador', date: `${year}-05-01`, scope: 'national', isRecurring: true },
    { name: 'Corpus Christi', date: formatBR(addDays(easter, 60)), scope: 'national', isRecurring: false, year },
    { name: 'Independência do Brasil', date: `${year}-09-07`, scope: 'national', isRecurring: true },
    { name: 'Nossa Senhora Aparecida', date: `${year}-10-12`, scope: 'national', isRecurring: true },
    { name: 'Finados', date: `${year}-11-02`, scope: 'national', isRecurring: true },
    { name: 'Proclamação da República', date: `${year}-11-15`, scope: 'national', isRecurring: true },
    { name: 'Natal', date: `${year}-12-25`, scope: 'national', isRecurring: true },
  ];
}

export async function seedHolidaysForYear(year?: number): Promise<number> {
  const targetYear = year ?? getYear();
  const holidays = generateNationalHolidays(targetYear);

  const existing = await db
    .select({ date: holidayRules.date })
    .from(holidayRules)
    .where(or(...holidays.map((h) => and(eq(holidayRules.date, h.date), eq(holidayRules.scope, h.scope)))));

  const existingDates = new Set(existing.map((e: { date: string }) => e.date));
  const toInsert = holidays.filter((h) => !existingDates.has(h.date));

  if (toInsert.length === 0) return 0;

  for (const holiday of toInsert) {
    await db.insert(holidayRules).values({
      id: crypto.randomUUID(),
      name: holiday.name,
      date: holiday.date,
      scope: holiday.scope,
      state_code: holiday.stateCode ?? null,
      city_code: holiday.cityCode ?? null,
      is_recurring: holiday.isRecurring,
      year: holiday.year ?? null,
    });
  }

  return toInsert.length;
}

export async function isHoliday(dateStr: string, scope?: 'national' | 'state' | 'municipal', stateCode?: string): Promise<boolean> {
  const monthDay = dateStr.substring(5);
  const conditions = [
    or(
      eq(holidayRules.date, dateStr),
      and(eq(holidayRules.is_recurring, true), sql`SUBSTRING(${holidayRules.date} FROM 6) = ${monthDay}`),
    ),
  ];

  if (scope) {
    conditions.push(eq(holidayRules.scope, scope));
  }

  if (stateCode) {
    conditions.push(eq(holidayRules.state_code, stateCode));
  }

  const rows = await db
    .select({ id: holidayRules.id })
    .from(holidayRules)
    .where(and(...conditions));

  return rows.length > 0;
}

export async function getHolidaysForDate(dateStr: string): Promise<{ name: string; scope: string }[]> {
  const monthDay = dateStr.substring(5);
  const rows = await db
    .select({ name: holidayRules.name, scope: holidayRules.scope })
    .from(holidayRules)
    .where(
      or(
        eq(holidayRules.date, dateStr),
        and(eq(holidayRules.is_recurring, true), sql`SUBSTRING(${holidayRules.date} FROM 6) = ${monthDay}`),
      ),
    );

  return rows.map((r: { name: string; scope: string }) => ({ name: r.name, scope: r.scope }));
}

export { generateNationalHolidays, easterDate, formatBR };
