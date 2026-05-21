export interface OperationHours {
  branch_id: string
  weekday: number
  open: string
  close: string
  is_open: boolean
}

export interface HolidayOverride {
  id: string
  branch_id: string
  date: string
  reason: string
  is_closed: boolean
  open_time?: string
  close_time?: string
}

export const mockOperationHours: OperationHours[] = [
  { branch_id: 'branch-1', weekday: 0, open: '08:00', close: '23:00', is_open: true },
  { branch_id: 'branch-1', weekday: 1, open: '08:00', close: '23:00', is_open: true },
  { branch_id: 'branch-1', weekday: 2, open: '08:00', close: '23:00', is_open: true },
  { branch_id: 'branch-1', weekday: 3, open: '08:00', close: '23:00', is_open: true },
  { branch_id: 'branch-1', weekday: 4, open: '08:00', close: '23:59', is_open: true },
  { branch_id: 'branch-1', weekday: 5, open: '08:00', close: '23:59', is_open: true },
  { branch_id: 'branch-1', weekday: 6, open: '09:00', close: '22:00', is_open: true },
]

export const mockOperationStatus = {
  isOpen: true,
  currentPeriod: { openTime: '08:00', closeTime: '23:00' },
  nextOpening: null,
  nextOpeningDate: null,
  reason: 'open' as const,
  overrideLabel: null,
}

export const mockHolidays: Record<string, unknown>[] = [
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
