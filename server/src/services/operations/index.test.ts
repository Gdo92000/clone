vi.mock('../../db', () => ({ db: { select: vi.fn(), insert: vi.fn() } }));

import { generateNationalHolidays, easterDate, formatBR } from './brazilian-holidays';

describe('easterDate', () => {
  it('computes 2024 easter as March 27', () => {
    const easter = easterDate(2024);
    expect(easter.getFullYear()).toBe(2024);
    expect(easter.getMonth()).toBe(2);
    expect(easter.getDate()).toBe(27);
  });

  it('computes 2025 easter as April 16', () => {
    const easter = easterDate(2025);
    expect(easter.getFullYear()).toBe(2025);
    expect(easter.getMonth()).toBe(3);
    expect(easter.getDate()).toBe(16);
  });

  it('computes 2023 easter as April 12', () => {
    const easter = easterDate(2023);
    expect(easter.getFullYear()).toBe(2023);
    expect(easter.getMonth()).toBe(3);
    expect(easter.getDate()).toBe(12);
  });
});

describe('formatBR', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(formatBR(new Date(2024, 0, 1))).toBe('2024-01-01');
  });

  it('pads single-digit month and day', () => {
    expect(formatBR(new Date(2024, 8, 5))).toBe('2024-09-05');
  });
});

describe('generateNationalHolidays', () => {
  const holidays = generateNationalHolidays(2024);

  it('includes Confraternização Universal on Jan 1', () => {
    expect(holidays).toContainEqual(
      expect.objectContaining({ name: 'Confraternização Universal', date: '2024-01-01' }),
    );
  });

  it('includes Natal on Dec 25', () => {
    expect(holidays).toContainEqual(
      expect.objectContaining({ name: 'Natal', date: '2024-12-25' }),
    );
  });

  it('includes Tiradentes on Apr 21', () => {
    expect(holidays).toContainEqual(
      expect.objectContaining({ name: 'Tiradentes', date: '2024-04-21' }),
    );
  });

  it('includes Dia do Trabalhador on May 1', () => {
    expect(holidays).toContainEqual(
      expect.objectContaining({ name: 'Dia do Trabalhador', date: '2024-05-01' }),
    );
  });

  it('includes Independência do Brasil on Sep 7', () => {
    expect(holidays).toContainEqual(
      expect.objectContaining({ name: 'Independência do Brasil', date: '2024-09-07' }),
    );
  });

  it('includes Nossa Senhora Aparecida on Oct 12', () => {
    expect(holidays).toContainEqual(
      expect.objectContaining({ name: 'Nossa Senhora Aparecida', date: '2024-10-12' }),
    );
  });

  it('includes Finados on Nov 2', () => {
    expect(holidays).toContainEqual(
      expect.objectContaining({ name: 'Finados', date: '2024-11-02' }),
    );
  });

  it('includes Proclamação da República on Nov 15', () => {
    expect(holidays).toContainEqual(
      expect.objectContaining({ name: 'Proclamação da República', date: '2024-11-15' }),
    );
  });

  it('includes Carnaval entries based on easter date', () => {
    const carnaval = holidays.filter((h) => h.name === 'Carnaval');
    expect(carnaval).toHaveLength(2);

    const easter = easterDate(2024);
    const carnaval47 = formatBR(new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 47));
    const carnaval48 = formatBR(new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 48));
    const dates = carnaval.map((h) => h.date);
    expect(dates).toContain(carnaval47);
    expect(dates).toContain(carnaval48);
  });

  it('includes Sexta-feira Santa 2 days before easter', () => {
    const holiday = holidays.find((h) => h.name === 'Sexta-feira Santa');
    expect(holiday).toBeDefined();

    const easter = easterDate(2024);
    const expected = formatBR(new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2));
    expect(holiday!.date).toBe(expected);
  });

  it('includes Corpus Christi 60 days after easter', () => {
    const holiday = holidays.find((h) => h.name === 'Corpus Christi');
    expect(holiday).toBeDefined();

    const easter = easterDate(2024);
    const expected = formatBR(new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 60));
    expect(holiday!.date).toBe(expected);
  });

  it('returns 12 holiday entries for a standard year', () => {
    expect(holidays).toHaveLength(12);
  });

  it('marks fixed-date holidays as recurring', () => {
    const recurring = holidays.filter((h) => h.isRecurring).map((h) => h.name);
    expect(recurring).toContain('Confraternização Universal');
    expect(recurring).toContain('Tiradentes');
    expect(recurring).toContain('Dia do Trabalhador');
    expect(recurring).toContain('Independência do Brasil');
    expect(recurring).toContain('Nossa Senhora Aparecida');
    expect(recurring).toContain('Finados');
    expect(recurring).toContain('Proclamação da República');
    expect(recurring).toContain('Natal');
  });

  it('marks movable holidays as non-recurring with year set', () => {
    const movable = holidays.filter((h) => !h.isRecurring);
    expect(movable.length).toBeGreaterThan(0);
    for (const h of movable) {
      expect(h.year).toBe(2024);
      expect(h.isRecurring).toBe(false);
    }
  });
});
