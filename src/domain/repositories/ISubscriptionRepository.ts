import type { Plan, PlanAddon, CompanySubscription, FeatureFlagOverride } from 'src/domain/entities/Plan';
import type { Invoice } from 'src/domain/entities/Invoice';
import type { RepositoryPort, RepositoryFilter } from './RepositoryPort';

export interface ISubscriptionRepository extends RepositoryPort<Plan> {
  findPlanById(id: string): Promise<Plan | null>;

  findAddons(): Promise<PlanAddon[]>;
  findAddonById(id: string): Promise<PlanAddon | null>;

  findSubscriptionByCompany(companyId: string): Promise<CompanySubscription | null>;
  findSubscriptions(filter?: RepositoryFilter<CompanySubscription>): Promise<CompanySubscription[]>;
  createSubscription(data: CompanySubscription): Promise<CompanySubscription>;
  updateBillingStatus(companyId: string, status: string): Promise<CompanySubscription | null>;

  findInvoicesByCompany(companyId: string): Promise<Invoice[]>;
  findAllInvoices(): Promise<Invoice[]>;
  createInvoice(data: Invoice): Promise<Invoice>;

  findFeatureOverrides(companyId: string): Promise<FeatureFlagOverride[]>;
  createFeatureOverride(data: FeatureFlagOverride): Promise<FeatureFlagOverride>;
}
