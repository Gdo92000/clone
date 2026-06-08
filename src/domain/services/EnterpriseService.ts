import type { IEnterpriseRepository } from 'src/domain/repositories/IEnterpriseRepository';
import type { DemoCategory, DemoProduct, DemoCompanyProfile, DemoCustomer, PlanLimitInfo } from 'src/domain/entities/Enterprise';

export class EnterpriseService {
  constructor(private readonly enterpriseRepo: IEnterpriseRepository) {}

  async getDemoData(): Promise<{
    categories: DemoCategory[];
    products: DemoProduct[];
    companyProfiles: DemoCompanyProfile[];
    customers: DemoCustomer[];
  }> {
    const [categories, products, companyProfiles, customers] = await Promise.all([
      this.enterpriseRepo.findDemoCategories(),
      this.enterpriseRepo.findDemoProducts(),
      this.enterpriseRepo.findDemoCompanyProfiles(),
      this.enterpriseRepo.findDemoCustomers(),
    ]);
    return { categories, products, companyProfiles, customers };
  }

  async getPlanLimits(companyId: string): Promise<PlanLimitInfo> {
    return this.enterpriseRepo.findPlanLimits(companyId);
  }
}
