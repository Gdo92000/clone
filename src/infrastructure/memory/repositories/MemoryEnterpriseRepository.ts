/* eslint-disable @typescript-eslint/require-await */
import type { IEnterpriseRepository } from 'src/domain/repositories/IEnterpriseRepository';
import type { DemoCategory, DemoProduct, DemoCompanyProfile, DemoCustomer, PlanLimitInfo } from 'src/domain/entities/Enterprise';
import type { AuditEvent } from 'src/domain/entities/AuditEvent';
import { mockDemoCategories, mockDemoProducts, mockDemoCompanyProfiles, mockDemoCustomers, mockPlanLimits } from '../data/enterprise';

export class MemoryEnterpriseRepository implements IEnterpriseRepository {
  private demoCategories: Array<DemoCategory & { deletedAt?: string | null }> = [...mockDemoCategories];
  private demoProducts = [...mockDemoProducts];
  private demoCompanyProfiles = [...mockDemoCompanyProfiles];
  private demoCustomers = [...mockDemoCustomers];
  private planLimits = { ...mockPlanLimits };
  private auditEvents: AuditEvent[] = [];

  private isDeleted(item: { deletedAt?: string | null }): boolean {
    return item.deletedAt != null;
  }

  async findMany(filter?: { includeDeleted?: boolean }): Promise<Record<string, unknown>[]> {
    const include = filter?.includeDeleted === true;
    return this.demoCategories
      .filter(c => include || !this.isDeleted(c))
      .map(c => ({ ...c }));
  }

  async findById(id: string, options?: { includeDeleted?: boolean }): Promise<Record<string, unknown> | null> {
    const found = this.demoCategories.find(c => c.id === id);
    if (!found) return null;
    if (!options?.includeDeleted && this.isDeleted(found)) return null;
    return { ...found };
  }

  async findByIds(ids: string[], options?: { includeDeleted?: boolean }): Promise<Record<string, unknown>[]> {
    const include = options?.includeDeleted === true;
    return this.demoCategories
      .filter(c => ids.includes(c.id))
      .filter(c => include || !this.isDeleted(c))
      .map(c => ({ ...c }));
  }

  async create(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const item = {
      id: typeof data['id'] === 'string' ? data['id'] : crypto.randomUUID(),
      deletedAt: null,
      ...data,
    } as DemoCategory & { deletedAt?: string | null };
    this.demoCategories.push(item);
    return { ...item };
  }

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<Record<string, unknown> | null> {
    const idx = this.demoCategories.findIndex(c => c['id'] === id);
    if (idx === -1) return null;
    const current = this.demoCategories[idx];
    if (!current || this.isDeleted(current)) return null;
    const updated: DemoCategory & { deletedAt?: string | null } = { ...current, ...data, deletedAt: current.deletedAt ?? null };
    this.demoCategories[idx] = updated;
    return { ...updated };
  }

  async remove(id: string): Promise<boolean> {
    const idx = this.demoCategories.findIndex(c => c['id'] === id);
    if (idx === -1) return false;
    const current = this.demoCategories[idx];
    if (!current || this.isDeleted(current)) return false;
    const updated: DemoCategory & { deletedAt?: string | null } = { ...current, deletedAt: new Date().toISOString() };
    this.demoCategories[idx] = updated;
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const idx = this.demoCategories.findIndex(c => c['id'] === id);
    if (idx === -1) return false;
    const current = this.demoCategories[idx];
    if (!current || !this.isDeleted(current)) return false;
    const updated: DemoCategory & { deletedAt?: string | null } = { ...current, deletedAt: null };
    this.demoCategories[idx] = updated;
    return true;
  }

  async count(filter?: { includeDeleted?: boolean }): Promise<number> {
    const include = filter?.includeDeleted === true;
    return this.demoCategories.filter(c => include || !this.isDeleted(c)).length;
  }

  async exists(id: string, options?: { includeDeleted?: boolean }): Promise<boolean> {
    const item = this.demoCategories.find(c => c.id === id);
    if (!item) return false;
    if (!options?.includeDeleted && this.isDeleted(item)) return false;
    return true;
  }

  async findDemoCategories(): Promise<DemoCategory[]> {
    return this.demoCategories;
  }

  async findDemoProducts(): Promise<DemoProduct[]> {
    return this.demoProducts;
  }

  async findDemoCompanyProfiles(): Promise<DemoCompanyProfile[]> {
    return this.demoCompanyProfiles;
  }

  async findDemoCustomers(): Promise<DemoCustomer[]> {
    return this.demoCustomers;
  }

  async findPlanLimits(_companyId: string): Promise<PlanLimitInfo> {
    return this.planLimits;
  }

  async updatePlanLimits(_companyId: string, limits: Partial<PlanLimitInfo>): Promise<PlanLimitInfo> {
    Object.assign(this.planLimits, limits);
    return this.planLimits;
  }

  async findAuditEventsByCompany(_companyId: string): Promise<AuditEvent[]> {
    return this.auditEvents;
  }

  async recordAuditEvent(_companyId: string, event: AuditEvent): Promise<AuditEvent> {
    this.auditEvents.push(event);
    return event;
  }
}
