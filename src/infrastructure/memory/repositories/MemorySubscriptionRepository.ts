/* eslint-disable @typescript-eslint/require-await */
import type { ISubscriptionRepository } from 'src/domain/repositories/ISubscriptionRepository';
import type { Plan, PlanAddon, CompanySubscription, FeatureFlagOverride } from 'src/domain/entities/Plan';
import type { Invoice } from 'src/domain/entities/Invoice';
import { mockPlans, mockAddons } from '../data/subscription-plans';
import { mockSubscriptions } from '../data/subscriptions';
import { mockInvoices } from '../data/invoices';

export class MemorySubscriptionRepository implements ISubscriptionRepository {
  private plans = [...mockPlans];
  private addons = [...mockAddons];
  private subscriptions = [...mockSubscriptions];
  private invoices = [...mockInvoices];

  async findMany(): Promise<Plan[]> {
    return this.plans;
  }

  async findById(id: string): Promise<Plan | null> {
    const found = this.plans.find(p => p.id === id);
    return found ?? null;
  }

  async findByIds(ids: string[]): Promise<Plan[]> {
    return this.plans.filter(p => ids.includes(p.id));
  }

  async create(data: Record<string, unknown>): Promise<Plan> {
    const item = { id: crypto.randomUUID(), ...data } as unknown as Plan;
    this.plans.push(item);
    return item;
  }

  async update(id: string, data: Partial<Plan>): Promise<Plan | null> {
    const found = this.plans.find(p => p.id === id);
    if (!found) return null;
    Object.assign(found, data);
    return found;
  }

  async remove(id: string): Promise<boolean> {
    const index = this.plans.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.plans.splice(index, 1);
    return true;
  }

  async count(): Promise<number> {
    return this.plans.length;
  }

  async exists(id: string): Promise<boolean> {
    return this.plans.some(p => p.id === id);
  }

  async findPlanById(id: string): Promise<Plan | null> {
    return this.findById(id);
  }

  async findAddons(): Promise<PlanAddon[]> {
    return this.addons;
  }

  async findAddonById(id: string): Promise<PlanAddon | null> {
    const found = this.addons.find(a => a.id === id);
    return found ?? null;
  }

  async findSubscriptionByCompany(companyId: string): Promise<CompanySubscription | null> {
    const found = this.subscriptions.find(s => s.companyId === companyId);
    return found ?? null;
  }

  async createSubscription(data: CompanySubscription): Promise<CompanySubscription> {
    this.subscriptions.push(data);
    return data;
  }

  async updateBillingStatus(companyId: string, status: string): Promise<CompanySubscription | null> {
    const found = this.subscriptions.find(s => s.companyId === companyId);
    if (!found) return null;
    Object.assign(found, { billingStatus: status });
    return found;
  }

  async findInvoicesByCompany(companyId: string): Promise<Invoice[]> {
    return this.invoices.filter(i => i.companyId === companyId);
  }

  async createInvoice(data: Invoice): Promise<Invoice> {
    this.invoices.push(data);
    return data;
  }

  async findSubscriptions(): Promise<CompanySubscription[]> {
    return this.subscriptions;
  }

  async findAllInvoices(): Promise<Invoice[]> {
    return this.invoices;
  }

  async findFeatureOverrides(_companyId: string): Promise<FeatureFlagOverride[]> {
    return [];
  }

  async createFeatureOverride(data: FeatureFlagOverride): Promise<FeatureFlagOverride> {
    return data;
  }
}
