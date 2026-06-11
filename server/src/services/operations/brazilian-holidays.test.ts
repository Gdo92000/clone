import { describe, it, expect, vi, beforeEach } from 'vitest';

const selectMock = { from: vi.fn() };
const insertMock = vi.fn();

vi.mock('../../db', () => ({
  db: {
    select: vi.fn().mockReturnValue(selectMock),
    insert: vi.fn().mockReturnValue({ values: insertMock }),
  },
}));

vi.mock('../../db/schema/operations', () => ({
  holidayRules: { date: 'date', scope: 'scope', is_recurring: 'is_recurring', state_code: 'state_code', id: 'id', name: 'name' },
}));

describe('brazilian-holidays', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('easterDate', () => {
    it('calculates easter date for 2026', async () => {
      const { easterDate } = await import('./brazilian-holidays');
      const date = easterDate(2026);
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(3);
      expect(date.getDate()).toBe(8);
    });

    it('calculates easter date for 2025', async () => {
      const { easterDate } = await import('./brazilian-holidays');
      const date = easterDate(2025);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(3);
      expect(date.getDate()).toBe(16);
    });
  });

  describe('formatBR', () => {
    it('formats date as YYYY-MM-DD', async () => {
      const { formatBR } = await import('./brazilian-holidays');
      const date = new Date(2026, 0, 15);
      const formatted = formatBR(date);
      expect(formatted).toBe('2026-01-15');
    });
  });

  describe('generateNationalHolidays', () => {
    it('generates fixed national holidays', async () => {
      const { generateNationalHolidays } = await import('./brazilian-holidays');
      const holidays = generateNationalHolidays(2026);

      expect(holidays.some(h => h.name === 'Natal' && h.date === '2026-12-25')).toBe(true);
      expect(holidays.some(h => h.name === 'Independência do Brasil' && h.date === '2026-09-07')).toBe(true);
    });

    it('generates easter-based holidays', async () => {
      const { generateNationalHolidays } = await import('./brazilian-holidays');
      const holidays = generateNationalHolidays(2026);

      expect(holidays.some(h => h.name === 'Carnaval')).toBe(true);
      expect(holidays.some(h => h.name === 'Sexta-feira Santa')).toBe(true);
    });
  });

  describe('seedHolidaysForYear', () => {
    it('inserts new holidays', async () => {
      selectMock.from.mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      });
      insertMock.mockReturnValue({});

      const { seedHolidaysForYear } = await import('./brazilian-holidays');
      const count = await seedHolidaysForYear(2026);

      expect(count).toBeGreaterThan(0);
      expect(insertMock).toHaveBeenCalled();
    });

    it('skips existing holidays', async () => {
      const existingHolidays = [{ date: '2026-01-01' }, { date: '2026-12-25' }];
      selectMock.from.mockReturnValue({
        where: vi.fn().mockResolvedValue(existingHolidays),
      });

      const { seedHolidaysForYear } = await import('./brazilian-holidays');
      const count = await seedHolidaysForYear(2026);

      expect(count).toBeLessThan(12);
    });
  });

  describe('isHoliday', () => {
    it('returns true for fixed holiday', async () => {
      selectMock.from.mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: '1' }]),
      });

      const { isHoliday } = await import('./brazilian-holidays');
      const result = await isHoliday('2026-12-25');

      expect(result).toBe(true);
    });

    it('returns false for non-holiday', async () => {
      selectMock.from.mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      });

      const { isHoliday } = await import('./brazilian-holidays');
      const result = await isHoliday('2026-03-15');

      expect(result).toBe(false);
    });
  });

  describe('getHolidaysForDate', () => {
    it('returns list of holidays for date', async () => {
      const holidays = [{ name: 'Natal', scope: 'national' }];
      selectMock.from.mockReturnValue({
        where: vi.fn().mockResolvedValue(holidays),
      });

      const { getHolidaysForDate } = await import('./brazilian-holidays');
      const result = await getHolidaysForDate('2026-12-25');

      expect(result).toEqual([{ name: 'Natal', scope: 'national' }]);
    });

    it('returns empty array for non-holiday', async () => {
      selectMock.from.mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      });

      const { getHolidaysForDate } = await import('./brazilian-holidays');
      const result = await getHolidaysForDate('2026-03-15');

      expect(result).toEqual([]);
    });
  });
});