import type { RepositoryPort } from './RepositoryPort';

export interface BusinessHour {
  dayOfWeek: number;
  open: string;
  close: string;
  isOpen: boolean;
}

export interface OperationStatus {
  isOpen: boolean;
  message?: string;
  nextOpenTime?: string;
}

export interface HolidayRule {
  date: string;
  description: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
}

export interface IOperationsRepository extends RepositoryPort<Record<string, unknown>> {
  findBusinessHours(branchId: string): Promise<BusinessHour[]>;
  updateBusinessHours(branchId: string, hours: BusinessHour[]): Promise<BusinessHour[]>;

  findOperationStatus(branchId: string): Promise<OperationStatus>;

  findHolidays(branchId: string): Promise<HolidayRule[]>;
  addHoliday(branchId: string, holiday: HolidayRule): Promise<HolidayRule>;

  findTheme(): Promise<ThemeSettings | null>;
  updateTheme(theme: ThemeSettings): Promise<ThemeSettings>;
}
