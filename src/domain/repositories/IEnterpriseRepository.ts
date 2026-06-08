import type {
  DemoCategory,
  DemoProduct,
  DemoCompanyProfile,
  DemoCustomer,
  PlanLimitInfo,
} from 'src/domain/entities/Enterprise';
import type { AuditEvent } from 'src/domain/entities/AuditEvent';
import type { RepositoryPort } from './RepositoryPort';

export interface IEnterpriseRepository extends RepositoryPort<Record<string, unknown>> {
  // Demo data
  findDemoCategories(): Promise<DemoCategory[]>;
  findDemoProducts(): Promise<DemoProduct[]>;
  findDemoCompanyProfiles(): Promise<DemoCompanyProfile[]>;
  findDemoCustomers(): Promise<DemoCustomer[]>;

  // Plan limits
  findPlanLimits(companyId: string): Promise<PlanLimitInfo>;
  updatePlanLimits(companyId: string, limits: Partial<PlanLimitInfo>): Promise<PlanLimitInfo>;

  // Audit
  findAuditEventsByCompany(companyId: string): Promise<AuditEvent[]>;
  recordAuditEvent(companyId: string, event: AuditEvent): Promise<AuditEvent>;
}
