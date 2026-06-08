export interface BusinessHour {
  id: string;
  branchId: string;
  weekday: string;
  isClosed: boolean;
  is24h: boolean;
  sortOrder: number;
  periods: { openTime: string; closeTime: string }[];
}

const defaultPeriod = { openTime: '08:00', closeTime: '23:00' };
const extendedPeriod = { openTime: '08:00', closeTime: '23:59' };

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const mockBusinessHours: BusinessHour[] = weekdays.map((day, i) => ({
  id: `bh-${day}`,
  branchId: 'branch-1',
  weekday: day,
  isClosed: false,
  is24h: false,
  sortOrder: i,
  periods: day === 'friday' || day === 'saturday' ? [extendedPeriod] : [defaultPeriod],
}));

export const mockOperationStatus = {
  isOpen: true,
  currentPeriod: { openTime: '08:00', closeTime: '23:00' },
  nextOpening: null,
  nextOpeningDate: null,
  reason: 'open' as const,
  overrideLabel: null as string | null,
};

export const mockHolidays = [
  { id: 'hol-1', name: 'Confraternização Universal', date: '2026-01-01', isRecurring: true },
  { id: 'hol-2', name: 'Carnaval', date: '2026-02-17', isRecurring: true },
  { id: 'hol-3', name: 'Paixão de Cristo', date: '2026-04-03', isRecurring: true },
  { id: 'hol-4', name: 'Tiradentes', date: '2026-04-21', isRecurring: true },
  { id: 'hol-5', name: 'Dia do Trabalho', date: '2026-05-01', isRecurring: true },
  { id: 'hol-6', name: 'Independência', date: '2026-09-07', isRecurring: true },
  { id: 'hol-7', name: 'Nossa Sra. Aparecida', date: '2026-10-12', isRecurring: true },
  { id: 'hol-8', name: 'Finados', date: '2026-11-02', isRecurring: true },
  { id: 'hol-9', name: 'Proclamação da República', date: '2026-11-15', isRecurring: true },
  { id: 'hol-10', name: 'Natal', date: '2026-12-25', isRecurring: true },
];
