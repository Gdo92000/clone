/* eslint-disable @typescript-eslint/require-await */
import type { IOperationsRepository, BusinessHour, OperationStatus, HolidayRule, ThemeSettings } from 'src/domain/repositories/IOperationsRepository';
import { mockBusinessHours as dataHours, mockOperationStatus as dataStatus, mockHolidays as dataHolidays, type BusinessHour as DataBusinessHour } from '../data/operations';
import { mockTheme } from '../data/theme';

type StoredHour = DataBusinessHour & { deletedAt?: string | null };

export class MemoryOperationsRepository implements IOperationsRepository {
  private hours: StoredHour[] = [...dataHours];
  private holidays: HolidayRule[] = dataHolidays.map(h => ({
    date: h.date,
    description: h.name,
    isOpen: false,
  }));
  private theme = { ...mockTheme };

  private isDeleted(item: { deletedAt?: string | null }): boolean {
    return item.deletedAt != null;
  }

  async findMany(filter?: { includeDeleted?: boolean }): Promise<Record<string, unknown>[]> {
    const include = filter?.includeDeleted === true;
    return this.hours
      .filter(h => include || !this.isDeleted(h))
      .map(h => ({ ...h }));
  }

  async findById(id: string, options?: { includeDeleted?: boolean }): Promise<Record<string, unknown> | null> {
    const found = this.hours.find(h => h.id === id);
    if (!found) return null;
    if (!options?.includeDeleted && this.isDeleted(found)) return null;
    return { ...found };
  }

  async findByIds(ids: string[], options?: { includeDeleted?: boolean }): Promise<Record<string, unknown>[]> {
    const include = options?.includeDeleted === true;
    return this.hours
      .filter(h => ids.includes(h.id))
      .filter(h => include || !this.isDeleted(h))
      .map(h => ({ ...h }));
  }

  async create(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const item: StoredHour = {
      id: typeof data['id'] === 'string' ? data['id'] : crypto.randomUUID(),
      deletedAt: null,
      ...data,
    } as StoredHour;
    this.hours.push(item);
    return { ...item };
  }

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<Record<string, unknown> | null> {
    const idx = this.hours.findIndex(h => h['id'] === id);
    if (idx === -1) return null;
    const current = this.hours[idx];
    if (!current || this.isDeleted(current)) return null;
    const updated: StoredHour = { ...current, ...data, deletedAt: current.deletedAt ?? null };
    this.hours[idx] = updated;
    return { ...updated };
  }

  async remove(id: string): Promise<boolean> {
    const idx = this.hours.findIndex(h => h['id'] === id);
    if (idx === -1) return false;
    const current = this.hours[idx];
    if (!current || this.isDeleted(current)) return false;
    const updated: StoredHour = { ...current, deletedAt: new Date().toISOString() };
    this.hours[idx] = updated;
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const idx = this.hours.findIndex(h => h['id'] === id);
    if (idx === -1) return false;
    const current = this.hours[idx];
    if (!current || !this.isDeleted(current)) return false;
    const updated: StoredHour = { ...current, deletedAt: null };
    this.hours[idx] = updated;
    return true;
  }

  async count(filter?: { includeDeleted?: boolean }): Promise<number> {
    const include = filter?.includeDeleted === true;
    return this.hours.filter(h => include || !this.isDeleted(h)).length;
  }

  async exists(id: string, options?: { includeDeleted?: boolean }): Promise<boolean> {
    const item = this.hours.find(h => h.id === id);
    if (!item) return false;
    if (!options?.includeDeleted && this.isDeleted(item)) return false;
    return true;
  }

  async findBusinessHours(_branchId: string): Promise<BusinessHour[]> {
    return this.hours.map(h => {
      const idx = dataHours.indexOf(h);
      const period = h.periods[0];
      return {
        dayOfWeek: idx >= 0 ? idx : 0,
        open: period ? period.openTime : '08:00',
        close: period ? period.closeTime : '23:00',
        isOpen: !h.isClosed,
      };
    });
  }

  async updateBusinessHours(branchId: string, hours: BusinessHour[]): Promise<BusinessHour[]> {
    this.hours = this.hours.filter(h => h.branchId !== branchId);
    this.hours.push(...hours.map((h, i) => ({
      id: `bh-${branchId}-${i}`,
      branchId,
      weekday: ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][h.dayOfWeek] ?? 'monday',
      isClosed: !h.isOpen,
      is24h: false,
      sortOrder: h.dayOfWeek,
      periods: [{ openTime: h.open, closeTime: h.close }],
    })));
    return hours;
  }

  async findOperationStatus(_branchId: string): Promise<OperationStatus> {
    return { isOpen: dataStatus.isOpen };
  }

  async findHolidays(_branchId: string): Promise<HolidayRule[]> {
    return [...this.holidays];
  }

  async addHoliday(_branchId: string, holiday: HolidayRule): Promise<HolidayRule> {
    this.holidays.push(holiday);
    return holiday;
  }

  async findTheme(): Promise<ThemeSettings | null> {
    return {
      primaryColor: this.theme.primaryColor,
      secondaryColor: this.theme.secondaryColor,
      logoUrl: this.theme.logoUrl,
      faviconUrl: this.theme.faviconUrl,
    };
  }

  async updateTheme(theme: ThemeSettings): Promise<ThemeSettings> {
    this.theme = { ...this.theme, ...theme };
    return theme;
  }
}
