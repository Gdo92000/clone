import type { ISubscriptionRepository } from 'src/domain/repositories/ISubscriptionRepository';
import type { Plan, PlanAddon, CompanySubscription } from 'src/domain/entities/Plan';
import type { Invoice } from 'src/domain/entities/Invoice';

export class SubscriptionService {
  constructor(private readonly subscriptionRepo: ISubscriptionRepository) {}

  async listPlans(): Promise<Plan[]> {
    return this.subscriptionRepo.findMany();
  }

  async getPlan(id: string): Promise<Plan | null> {
    return this.subscriptionRepo.findPlanById(id);
  }

  async listAddons(): Promise<PlanAddon[]> {
    return this.subscriptionRepo.findAddons();
  }

  async getCompanySubscription(companyId: string): Promise<CompanySubscription | null> {
    return this.subscriptionRepo.findSubscriptionByCompany(companyId);
  }

  async listInvoices(companyId: string): Promise<Invoice[]> {
    return this.subscriptionRepo.findInvoicesByCompany(companyId);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return this.subscriptionRepo.findAllInvoices();
  }

  // Additional methods to match the hook
  async getAddons(): Promise<PlanAddon[]> {
    return this.listAddons();
  }

  async getSubscriptions(): Promise<CompanySubscription[]> {
    return this.subscriptionRepo.findSubscriptions();
  }
}
