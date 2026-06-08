import type { BusinessHour, BusinessHourPeriod, TimePeriod, OpenStatus, HolidayRule } from 'src/api/operationsApi'

const mockWeekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const defaultPeriods: BusinessHourPeriod[] = [
  { id: 'period-default-1', business_hour_id: 'bh-default', open_time: '08:00', close_time: '23:00', sort_order: 0 },
]

const fridayPeriods: BusinessHourPeriod[] = [
  { id: 'period-fri-1', business_hour_id: 'bh-fri', open_time: '08:00', close_time: '23:59', sort_order: 0 },
]

export const mockBusinessHours: BusinessHour[] = mockWeekdays.map((day, i) => ({
  id: `bh-${day}`,
  branch_id: 'branch-1',
  weekday: day,
  is_closed: false,
  is_24h: false,
  sort_order: i,
  periods: day === 'friday' || day === 'saturday' ? fridayPeriods : defaultPeriods,
}))

export const mockOperationStatus: OpenStatus = {
  isOpen: true,
  currentPeriod: { openTime: '08:00', closeTime: '23:00' },
  nextOpening: null,
  nextOpeningDate: null,
  reason: 'open',
  overrideLabel: null,
}

export const mockTodayPeriods: TimePeriod[] = [
  { openTime: '08:00', closeTime: '23:00' },
]

export const mockHolidays: HolidayRule[] = [
  { id: 'hol-1', name: 'Confraternização Universal', date: '2026-01-01', scope: 'national', state_code: null, city_code: null, is_recurring: true, year: 2026 },
  { id: 'hol-2', name: 'Carnaval', date: '2026-02-17', scope: 'national', state_code: null, city_code: null, is_recurring: true, year: 2026 },
  { id: 'hol-3', name: 'Paixão de Cristo', date: '2026-04-03', scope: 'national', state_code: null, city_code: null, is_recurring: true, year: 2026 },
  { id: 'hol-4', name: 'Tiradentes', date: '2026-04-21', scope: 'national', state_code: null, city_code: null, is_recurring: true, year: 2026 },
  { id: 'hol-5', name: 'Dia do Trabalho', date: '2026-05-01', scope: 'national', state_code: null, city_code: null, is_recurring: true, year: 2026 },
  { id: 'hol-6', name: 'Independência', date: '2026-09-07', scope: 'national', state_code: null, city_code: null, is_recurring: true, year: 2026 },
  { id: 'hol-7', name: 'Nossa Sra. Aparecida', date: '2026-10-12', scope: 'national', state_code: null, city_code: null, is_recurring: true, year: 2026 },
  { id: 'hol-8', name: 'Finados', date: '2026-11-02', scope: 'national', state_code: null, city_code: null, is_recurring: true, year: 2026 },
  { id: 'hol-9', name: 'Proclamação da República', date: '2026-11-15', scope: 'national', state_code: null, city_code: null, is_recurring: true, year: 2026 },
  { id: 'hol-10', name: 'Natal', date: '2026-12-25', scope: 'national', state_code: null, city_code: null, is_recurring: true, year: 2026 },
]

export const mockTheme = {
  theme: 'default',
}
