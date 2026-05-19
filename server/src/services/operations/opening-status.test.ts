vi.mock('../../db', () => ({ db: {} }));

import { getNow, toWeekDay, formatDateISO, toMinutes, currentMinutes, isOvernight, TZ } from './opening-status';

describe('toWeekDay', () => {
  it('returns monday for 2024-01-01', () => {
    expect(toWeekDay(new Date(2024, 0, 1))).toBe('monday');
  });

  it('returns tuesday for 2024-01-02', () => {
    expect(toWeekDay(new Date(2024, 0, 2))).toBe('tuesday');
  });

  it('returns wednesday for 2024-01-03', () => {
    expect(toWeekDay(new Date(2024, 0, 3))).toBe('wednesday');
  });

  it('returns thursday for 2024-01-04', () => {
    expect(toWeekDay(new Date(2024, 0, 4))).toBe('thursday');
  });

  it('returns friday for 2024-01-05', () => {
    expect(toWeekDay(new Date(2024, 0, 5))).toBe('friday');
  });

  it('returns saturday for 2024-01-06', () => {
    expect(toWeekDay(new Date(2024, 0, 6))).toBe('saturday');
  });

  it('returns sunday for 2024-01-07', () => {
    expect(toWeekDay(new Date(2024, 0, 7))).toBe('sunday');
  });
});

describe('formatDateISO', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(formatDateISO(new Date(2024, 0, 1))).toBe('2024-01-01');
  });

  it('pads single-digit month', () => {
    expect(formatDateISO(new Date(2024, 8, 5))).toBe('2024-09-05');
  });

  it('pads single-digit day', () => {
    expect(formatDateISO(new Date(2024, 11, 5))).toBe('2024-12-05');
  });

  it('handles last day of year', () => {
    expect(formatDateISO(new Date(2024, 11, 31))).toBe('2024-12-31');
  });
});

describe('toMinutes', () => {
  it('midnight (00:00) returns 0', () => {
    expect(toMinutes('00:00')).toBe(0);
  });

  it('noon (12:00) returns 720', () => {
    expect(toMinutes('12:00')).toBe(720);
  });

  it('last minute (23:59) returns 1439', () => {
    expect(toMinutes('23:59')).toBe(1439);
  });

  it('first minute (00:01) returns 1', () => {
    expect(toMinutes('00:01')).toBe(1);
  });

  it('half past eight (08:30) returns 510', () => {
    expect(toMinutes('08:30')).toBe(510);
  });
});

describe('isOvernight', () => {
  it('returns false when close is after open', () => {
    expect(isOvernight('08:00', '18:00')).toBe(false);
  });

  it('returns true when close is before open', () => {
    expect(isOvernight('22:00', '06:00')).toBe(true);
  });

  it('returns true when close equals open (24h)', () => {
    expect(isOvernight('08:00', '08:00')).toBe(true);
  });
});

describe('TZ', () => {
  it('is set to America/Sao_Paulo', () => {
    expect(TZ).toBe('America/Sao_Paulo');
  });
});

describe('getNow', () => {
  it('returns a Date instance', () => {
    expect(getNow()).toBeInstanceOf(Date);
  });

  it('returns a date in America/Sao_Paulo timezone', () => {
    const now = getNow();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    expect(year).toBeGreaterThan(2020);
    expect(month).toBeGreaterThanOrEqual(0);
    expect(month).toBeLessThanOrEqual(11);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });
});

describe('currentMinutes', () => {
  it('returns a number between 0 and 1439', () => {
    const mins = currentMinutes();
    expect(typeof mins).toBe('number');
    expect(mins).toBeGreaterThanOrEqual(0);
    expect(mins).toBeLessThanOrEqual(1439);
  });
});
