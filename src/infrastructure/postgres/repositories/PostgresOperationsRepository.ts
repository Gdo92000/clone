/* eslint-disable @typescript-eslint/require-await */
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import type { IOperationsRepository, BusinessHour, OperationStatus, HolidayRule, ThemeSettings } from 'src/domain/repositories/IOperationsRepository';
import { businessHours, holidayRules } from 'server/src/db/schema/operations';
import { fromDbRows, fromDbRow } from '../helpers';

export class PostgresOperationsRepository implements IOperationsRepository {
  constructor(private readonly _db: PostgresJsDatabase) {}

  async findMany(filter?: { includeDeleted?: boolean }): Promise<Record<string, unknown>[]> {
    const rows = await this._db.select().from(businessHours);
    if (filter?.includeDeleted) return fromDbRows(rows);
    return fromDbRows(rows.filter((r) => (r as { deleted_at?: unknown }).deleted_at == null));
  }

  async findById(id: string, options?: { includeDeleted?: boolean }): Promise<Record<string, unknown> | null> {
    const rows = await this._db.select().from(businessHours).where(eq(businessHours.id, id)).limit(1);
    if (!rows[0]) return null;
    if (!options?.includeDeleted && (rows[0] as { deleted_at?: unknown }).deleted_at != null) return null;
    return { ...fromDbRow(rows[0]) };
  }

  async findByIds(ids: string[], options?: { includeDeleted?: boolean }): Promise<Record<string, unknown>[]> {
    if (ids.length === 0) return [];
    const rows = await this._db.select().from(businessHours);
    return fromDbRows(rows.filter((r) => {
      if (!ids.includes(r.id)) return false;
      if (!options?.includeDeleted && (r as { deleted_at?: unknown }).deleted_at != null) return false;
      return true;
    }));
  }

  async create(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const id = typeof data['id'] === 'string' ? data['id'] : crypto.randomUUID();
    const weekday = typeof data['weekday'] === 'string' ? data['weekday'] : 'monday';
    const branchId = typeof data['branchId'] === 'string' ? data['branchId'] : 'branch-1';
    const rows = await this._db.insert(businessHours).values({
      id,
      branch_id: branchId,
      weekday: weekday as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
      is_closed: data['isClosed'] === true,
      is_24h: data['is24h'] === true,
      sort_order: typeof data['sortOrder'] === 'number' ? data['sortOrder'] : 0,
    } as typeof businessHours.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) };
  }

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<Record<string, unknown> | null> {
    const updates: Partial<typeof businessHours.$inferInsert> = {};
    if (typeof data['weekday'] === 'string') updates.weekday = data['weekday'] as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    if (typeof data['isClosed'] === 'boolean') updates.is_closed = data['isClosed'];
    if (typeof data['is24h'] === 'boolean') updates.is_24h = data['is24h'];
    if (typeof data['sortOrder'] === 'number') updates.sort_order = data['sortOrder'];
    if (typeof data['branchId'] === 'string') updates.branch_id = data['branchId'];
    updates.updated_at = new Date();

    const rows = await this._db.update(businessHours)
      .set(updates)
      .where(eq(businessHours.id, id))
      .returning();
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) };
  }

  async remove(id: string): Promise<boolean> {
    const result = await this._db.delete(businessHours).where(eq(businessHours.id, id)).returning();
    return result.length > 0;
  }

  async restore(id: string): Promise<boolean> {
    return this.remove(id);
  }

  async count(filter?: { includeDeleted?: boolean }): Promise<number> {
    const items = await this.findMany(filter);
    return items.length;
  }

  async exists(id: string, options?: { includeDeleted?: boolean }): Promise<boolean> {
    const row = await this.findById(id, options);
    return row !== null;
  }

  async findBusinessHours(branchId: string): Promise<BusinessHour[]> {
    const rows = await this._db.select().from(businessHours).where(eq(businessHours.branch_id, branchId));
    return fromDbRows<BusinessHour>(rows);
  }

  async updateBusinessHours(branchId: string, hours: BusinessHour[]): Promise<BusinessHour[]> {
    await this._db.delete(businessHours).where(eq(businessHours.branch_id, branchId));
    if (hours.length === 0) return [];
    const values = hours.map((h, i) => ({
      id: `bh-${branchId}-${i}-${Date.now()}`,
      branch_id: branchId,
      weekday: (['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][h.dayOfWeek] ?? 'monday') as 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday',
      is_closed: !h.isOpen,
      is_24h: false,
      sort_order: h.dayOfWeek,
    }));
    await this._db.insert(businessHours).values(values);
    return hours;
  }

  async findOperationStatus(_branchId: string): Promise<OperationStatus> {
    return { isOpen: true };
  }

  async findHolidays(_branchId: string): Promise<HolidayRule[]> {
    const rows = await this._db.select().from(holidayRules);
    const mapped: HolidayRule[] = fromDbRows<Record<string, unknown>>(rows).map((r) => ({
      date: typeof r['date'] === 'string' ? r['date'] : '',
      description: typeof r['name'] === 'string' ? r['name'] : '',
      isOpen: false,
    }));
    return mapped;
  }

  async addHoliday(_branchId: string, holiday: HolidayRule): Promise<HolidayRule> {
    await this._db.insert(holidayRules).values({
      id: `hr-${Date.now()}`,
      name: holiday.description,
      date: holiday.date,
      scope: 'national',
    } as typeof holidayRules.$inferInsert);
    return holiday;
  }

  async findTheme(): Promise<ThemeSettings | null> {
    return null;
  }

  async updateTheme(theme: ThemeSettings): Promise<ThemeSettings> {
    return theme;
  }
}
