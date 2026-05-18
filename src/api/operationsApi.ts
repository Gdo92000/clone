import { get, post, put, del } from './httpClient';

export interface TimePeriod {
  openTime: string;
  closeTime: string;
}

export interface OpenStatus {
  isOpen: boolean;
  currentPeriod: TimePeriod | null;
  nextOpening: TimePeriod | null;
  nextOpeningDate: string | null;
  reason: 'open' | 'closed' | 'holiday' | 'special_closed' | 'before_hours' | 'after_hours' | 'overnight_gap';
  overrideLabel: string | null;
}

export interface BusinessHourPeriod {
  id: string;
  business_hour_id: string;
  open_time: string;
  close_time: string;
  sort_order: number;
}

export interface BusinessHour {
  id: string;
  branch_id: string;
  weekday: string;
  is_closed: boolean | null;
  is_24h: boolean | null;
  sort_order: number | null;
  periods: BusinessHourPeriod[];
}

export interface HolidayOverride {
  id: string;
  branch_id: string;
  holiday_rule_id: string | null;
  override_type: 'closed' | 'open_normal' | 'custom_hours';
  custom_date: string;
  periods: { id: string; open_time: string; close_time: string; sort_order: number }[];
}

export interface SpecialDate {
  id: string;
  branch_id: string;
  date: string;
  label: string | null;
  is_closed: boolean | null;
  is_24h: boolean | null;
  periods: { id: string; open_time: string; close_time: string; sort_order: number }[];
}

export interface HolidayRule {
  id: string;
  name: string;
  date: string;
  scope: 'national' | 'state' | 'municipal';
  state_code: string | null;
  city_code: string | null;
  is_recurring: boolean | null;
  year: number | null;
}

export const operationsApi = {
  getStatus: (branchId: string) => get<OpenStatus>(`/operations/${branchId}/status`),
  getTodayPeriods: (branchId: string) => get<TimePeriod[]>(`/operations/${branchId}/today-periods`),
  getHours: (branchId: string) => get<BusinessHour[]>(`/operations/${branchId}/hours`),
  updateHours: (branchId: string, data: { branchId: string; hours: BusinessHourInput[] }) =>
    put<{ success: boolean }>(`/operations/${branchId}/hours`, data),
  getHolidayOverrides: (branchId: string) => get<HolidayOverride[]>(`/operations/${branchId}/holiday-overrides`),
  createHolidayOverride: (branchId: string, data: Record<string, unknown>) =>
    post<{ success: boolean; id: string }>(`/operations/${branchId}/holiday-overrides`, data),
  deleteHolidayOverride: (branchId: string, id: string) =>
    del<{ success: boolean }>(`/operations/${branchId}/holiday-overrides/${id}`),
  getSpecialDates: (branchId: string) => get<SpecialDate[]>(`/operations/${branchId}/special-dates`),
  createSpecialDate: (branchId: string, data: Record<string, unknown>) =>
    post<{ success: boolean; id: string }>(`/operations/${branchId}/special-dates`, data),
  deleteSpecialDate: (branchId: string, id: string) =>
    del<{ success: boolean }>(`/operations/${branchId}/special-dates/${id}`),
};

export const holidaysApi = {
  getAll: () => get<HolidayRule[]>('/holidays'),
  getByDate: (date: string) => get<{ name: string; scope: string }[]>(`/holidays/date/${date}`),
  seedYear: (year: number) => post<{ seeded: number; year: string }>(`/holidays/seed/${year}`),
  create: (data: Record<string, unknown>) => post<{ success: boolean; id: string }>('/holidays', data),
  delete: (id: string) => del<{ success: boolean }>(`/holidays/${id}`),
};

interface BusinessHourInput {
  weekday: string;
  isClosed: boolean;
  is24h: boolean;
  sortOrder: number;
  periods: { openTime: string; closeTime: string; sortOrder: number }[];
}
