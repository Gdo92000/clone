import type { IOperationsRepository, BusinessHour, OperationStatus, ThemeSettings } from 'src/domain/repositories/IOperationsRepository';

export class OperationsService {
  constructor(private readonly operationsRepo: IOperationsRepository) {}

  async getBusinessHours(branchId: string): Promise<BusinessHour[]> {
    return this.operationsRepo.findBusinessHours(branchId);
  }

  async updateBusinessHours(branchId: string, hours: BusinessHour[]): Promise<BusinessHour[]> {
    return this.operationsRepo.updateBusinessHours(branchId, hours);
  }

  async getOperationStatus(branchId: string): Promise<OperationStatus> {
    return this.operationsRepo.findOperationStatus(branchId);
  }

  async getTheme(): Promise<ThemeSettings | null> {
    return this.operationsRepo.findTheme();
  }

  async updateTheme(theme: ThemeSettings): Promise<ThemeSettings> {
    return this.operationsRepo.updateTheme(theme);
  }
}
