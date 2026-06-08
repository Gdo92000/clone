import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import type { ISubscriptionRepository } from 'src/domain/repositories/ISubscriptionRepository';
import type { Plan, PlanAddon, CompanySubscription, FeatureFlagOverride } from 'src/domain/entities/Plan';
import type { Invoice } from 'src/domain/entities/Invoice';
import { plans, addons, subscriptions, invoices, feature_flags } from 'server/src/db/schema/saas';
import { fromDbRows, fromDbRow, toDbInput } from '../helpers';

export class PostgresSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly _db: PostgresJsDatabase) {}

  async findMany(): Promise<Plan[]> {
    const rows = await this._db.select().from(plans);
    return fromDbRows<Plan>(rows);
  }

  async findById(id: string): Promise<Plan | null> {
    const typedId = id as 'basic' | 'pro' | 'premium';
    const rows = await this._db.select().from(plans).where(eq(plans.id, typedId)).limit(1);
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as Plan;
  }

  async findByIds(ids: string[]): Promise<Plan[]> {
    if (ids.length === 0) return [];
    const rows = await this._db.select().from(plans);
    return fromDbRows<Plan>(rows.filter((r) => ids.includes(r.id)));
  }

  async create(data: Record<string, unknown>): Promise<Plan> {
    const rows = await this._db.insert(plans).values(        toDbInput(data) as typeof plans.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as Plan;
  }

  async update(id: string, data: Partial<Plan>): Promise<Plan | null> {
    const typedId = id as 'basic' | 'pro' | 'premium';
    const rows = await this._db.update(plans).set(        toDbInput(data) as Partial<typeof plans.$inferInsert>).where(eq(plans.id, typedId)).returning();
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as Plan;
  }

  async remove(id: string): Promise<boolean> {
    await this._db.delete(plans).where(eq(plans.id, id as 'basic' | 'pro' | 'premium'));
    return true;
  }

  async count(): Promise<number> {
    const rows = await this._db.select().from(plans);
    return rows.length;
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.findById(id);
    return row !== null;
  }

  async findPlanById(id: string): Promise<Plan | null> {
    return this.findById(id);
  }

  async findAddons(): Promise<PlanAddon[]> {
    const rows = await this._db.select().from(addons);
    return fromDbRows<PlanAddon>(rows);
  }

  async findAddonById(id: string): Promise<PlanAddon | null> {
    const rows = await this._db.select().from(addons).where(eq(addons.id, id)).limit(1);
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as PlanAddon;
  }

  async findSubscriptionByCompany(companyId: string): Promise<CompanySubscription | null> {
    const rows = await this._db.select().from(subscriptions).where(eq(subscriptions.company_id, companyId)).limit(1);
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as CompanySubscription;
  }

  async createSubscription(data: CompanySubscription): Promise<CompanySubscription> {
    const rows = await this._db.insert(subscriptions).values(        toDbInput(data) as typeof subscriptions.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as CompanySubscription;
  }

  async updateBillingStatus(companyId: string, status: string): Promise<CompanySubscription | null> {
    const typedStatus = status as 'trial' | 'active' | 'past_due' | 'blocked' | 'cancelled';
    const rows = await this._db.update(subscriptions).set({ billing_status: typedStatus }).where(eq(subscriptions.company_id, companyId)).returning();
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as CompanySubscription;
  }

  async findInvoicesByCompany(companyId: string): Promise<Invoice[]> {
    const rows = await this._db.select().from(invoices).where(eq(invoices.company_id, companyId));
    return fromDbRows<Invoice>(rows);
  }

  async createInvoice(data: Invoice): Promise<Invoice> {
    const rows = await this._db.insert(invoices).values(        toDbInput(data) as typeof invoices.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as Invoice;
  }

  async findFeatureOverrides(companyId: string): Promise<FeatureFlagOverride[]> {
    const rows = await this._db.select().from(feature_flags).where(eq(feature_flags.company_id, companyId));
    return fromDbRows<FeatureFlagOverride>(rows);
  }

  async findSubscriptions(): Promise<CompanySubscription[]> {
    const rows = await this._db.select().from(subscriptions);
    return fromDbRows<CompanySubscription>(rows);
  }

  async findAllInvoices(): Promise<Invoice[]> {
    const rows = await this._db.select().from(invoices);
    return fromDbRows<Invoice>(rows);
  }

  async createFeatureOverride(data: FeatureFlagOverride): Promise<FeatureFlagOverride> {
    const rows = await this._db.insert(feature_flags).values(        toDbInput(data) as typeof feature_flags.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as FeatureFlagOverride;
  }
}
