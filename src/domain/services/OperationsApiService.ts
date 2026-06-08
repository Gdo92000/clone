import type {
  OpenStatus,
  TimePeriod,
  BusinessHour,
  HolidayOverride,
  SpecialDate,
  HolidayRule,
} from 'src/api/operationsApi';

interface OperationsApiClient {
  getStatus: (branchId: string) => Promise<OpenStatus>;
  getTodayPeriods: (branchId: string) => Promise<TimePeriod[]>;
  getHours: (branchId: string) => Promise<BusinessHour[]>;
  updateHours: (branchId: string, data: { branchId: string; hours: BusinessHourInput[] }) => Promise<{ success: boolean }>;
  getHolidayOverrides: (branchId: string) => Promise<HolidayOverride[]>;
  createHolidayOverride: (branchId: string, data: Record<string, unknown>) => Promise<{ success: boolean; id: string }>;
  deleteHolidayOverride: (branchId: string, id: string) => Promise<{ success: boolean }>;
  getSpecialDates: (branchId: string) => Promise<SpecialDate[]>;
  createSpecialDate: (branchId: string, data: Record<string, unknown>) => Promise<{ success: boolean; id: string }>;
  deleteSpecialDate: (branchId: string, id: string) => Promise<{ success: boolean }>;
}

interface HolidaysApiClient {
  getAll: () => Promise<HolidayRule[]>;
  getByDate: (date: string) => Promise<{ name: string; scope: string }[]>;
  seedYear: (year: number) => Promise<{ seeded: number; year: string }>;
  create: (data: Record<string, unknown>) => Promise<{ success: boolean; id: string }>;
  delete: (id: string) => Promise<{ success: boolean }>;
}

interface BusinessHourInput {
  weekday: string;
  isClosed: boolean;
  is24h: boolean;
  sortOrder: number;
  periods: { openTime: string; closeTime: string; sortOrder: number }[];
}

export class OperationsApiService {
  constructor(
    private readonly operationsApi: OperationsApiClient,
    private readonly holidaysApi: HolidaysApiClient
  ) {}

  async getStatus(branchId: string): Promise<OpenStatus> {
    return this.operationsApi.getStatus(branchId);
  }

  async getTodayPeriods(branchId: string): Promise<TimePeriod[]> {
    return this.operationsApi.getTodayPeriods(branchId);
  }

  async getHours(branchId: string): Promise<BusinessHour[]> {
    return this.operationsApi.getHours(branchId);
  }

  async updateHours(branchId: string, data: { branchId: string; hours: BusinessHourInput[] }): Promise<{ success: boolean }> {
    return this.operationsApi.updateHours(branchId, data);
  }

  async getHolidayOverrides(branchId: string): Promise<HolidayOverride[]> {
    return this.operationsApi.getHolidayOverrides(branchId);
  }

  async createHolidayOverride(branchId: string, data: Record<string, unknown>): Promise<{ success: boolean; id: string }> {
    return this.operationsApi.createHolidayOverride(branchId, data);
  }

  async deleteHolidayOverride(branchId: string, id: string): Promise<{ success: boolean }> {
    return this.operationsApi.deleteHolidayOverride(branchId, id);
  }

  async getSpecialDates(branchId: string): Promise<SpecialDate[]> {
    return this.operationsApi.getSpecialDates(branchId);
  }

  async createSpecialDate(branchId: string, data: Record<string, unknown>): Promise<{ success: boolean; id: string }> {
    return this.operationsApi.createSpecialDate(branchId, data);
  }

  async deleteSpecialDate(branchId: string, id: string): Promise<{ success: boolean }> {
    return this.operationsApi.deleteSpecialDate(branchId, id);
  }

  async getHolidays(): Promise<HolidayRule[]> {
    return this.holidaysApi.getAll();
  }

  async seedHolidays(year: number): Promise<{ seeded: number; year: string }> {
    return this.holidaysApi.seedYear(year);
  }
}
