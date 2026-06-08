import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import type { IEnterpriseRepository } from 'src/domain/repositories/IEnterpriseRepository';
import type { DemoCategory, DemoProduct, DemoCompanyProfile, DemoCustomer, PlanLimitInfo } from 'src/domain/entities/Enterprise';
import type { AuditEvent } from 'src/domain/entities/AuditEvent';
import { demoCategories, demoProducts, demoCompanyProfiles, demoCustomers, planLimits } from '../schema/enterprise';
import { fromDbRow, fromDbRows } from '../helpers';

export class PostgresEnterpriseRepository implements IEnterpriseRepository {
  constructor(private readonly _db: PostgresJsDatabase) {}

  async findMany(filter?: { includeDeleted?: boolean }): Promise<Record<string, unknown>[]> {
    const rows = await this._db.select().from(demoCategories);
    if (filter?.includeDeleted) return fromDbRows(rows);
    return fromDbRows(rows.filter((r) => (r as { deleted_at?: unknown }).deleted_at == null));
  }

  async findById(id: string, options?: { includeDeleted?: boolean }): Promise<Record<string, unknown> | null> {
    const rows = await this._db.select().from(demoCategories).where(eq(demoCategories.id, id)).limit(1);
    if (!rows[0]) return null;
    if (!options?.includeDeleted && (rows[0] as { deleted_at?: unknown }).deleted_at != null) return null;
    return { ...fromDbRow(rows[0]) };
  }

  async findByIds(ids: string[], options?: { includeDeleted?: boolean }): Promise<Record<string, unknown>[]> {
    if (ids.length === 0) return [];
    const rows = await this._db.select().from(demoCategories);
    return fromDbRows(rows.filter((r) => {
      if (!ids.includes(r.id)) return false;
      if (!options?.includeDeleted && (r as { deleted_at?: unknown }).deleted_at != null) return false;
      return true;
    }));
  }

  async create(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const id = typeof data['id'] === 'string' ? data['id'] : crypto.randomUUID();
    const name = typeof data['name'] === 'string' ? data['name'] : 'Unnamed';
    const cuisine = typeof data['cuisine'] === 'string' ? data['cuisine'] : 'other';
    const rows = await this._db.insert(demoCategories).values({
      id,
      name,
      cuisine,
      image_url: typeof data['imageUrl'] === 'string' ? data['imageUrl'] : null,
      tags: Array.isArray(data['tags']) ? data['tags'] : [],
    } as typeof demoCategories.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) };
  }

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<Record<string, unknown> | null> {
    const updates: Partial<typeof demoCategories.$inferInsert> = {};
    if (typeof data['name'] === 'string') updates.name = data['name'];
    if (typeof data['cuisine'] === 'string') updates.cuisine = data['cuisine'];
    if (typeof data['imageUrl'] === 'string') updates.image_url = data['imageUrl'];
    if (Array.isArray(data['tags'])) updates.tags = data['tags'];
    const rows = await this._db.update(demoCategories)
      .set(updates)
      .where(eq(demoCategories.id, id))
      .returning();
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) };
  }

  async remove(id: string): Promise<boolean> {
    const result = await this._db.delete(demoCategories).where(eq(demoCategories.id, id)).returning();
    return result.length > 0;
  }

  async restore(id: string): Promise<boolean> {
    return this.remove(id);
  }

  async count(filter?: { includeDeleted?: boolean }): Promise<number> {
    const items = await this.findMany(filter);
    return items.length;
  }

  async exists(id: string, options?: { includeDeleted?: boolean }): Promise<boolean> {
    const row = await this.findById(id, options);
    return row !== null;
  }

  async findDemoCategories(): Promise<DemoCategory[]> {
    const rows = await this._db.select().from(demoCategories);
    return rows.map((r) => ({ ...fromDbRow(r) } as DemoCategory));
  }

  async findDemoProducts(): Promise<DemoProduct[]> {
    const rows = await this._db.select().from(demoProducts);
    return rows.map((r) => ({ ...fromDbRow(r) } as DemoProduct));
  }

  async findDemoCompanyProfiles(): Promise<DemoCompanyProfile[]> {
    const rows = await this._db.select().from(demoCompanyProfiles);
    return rows.map((r) => ({ ...fromDbRow(r) } as DemoCompanyProfile));
  }

  async findDemoCustomers(): Promise<DemoCustomer[]> {
    const rows = await this._db.select().from(demoCustomers);
    return rows.map((r) => ({ ...fromDbRow(r) } as DemoCustomer));
  }

  async findPlanLimits(companyId: string): Promise<PlanLimitInfo> {
    const rows = await this._db.select().from(planLimits).where(eq(planLimits.company_id, companyId)).limit(1);
    const row = rows[0];
    if (!row) {
      return {
        limits: { branches: 0, products: 0, users: 0, campaigns: 0 },
        usage: { branches: 0, products: 0, users: 0, campaigns: 0, coupons: 0, reports: 0 },
        canAddBranch: false,
        canAddProduct: false,
        canInviteUser: false,
        canCreateCampaign: false,
      };
    }
    return {
      limits: {
        branches: Number(row.max_branches),
        products: Number(row.max_products),
        users: Number(row.max_users),
        campaigns: Number(row.max_campaigns),
      },
      usage: {
        branches: Number(row.usage_branches),
        products: Number(row.usage_products),
        users: Number(row.usage_users),
        campaigns: Number(row.usage_campaigns),
        coupons: Number(row.usage_coupons),
        reports: Number(row.usage_reports),
      },
      canAddBranch: Number(row.usage_branches) < Number(row.max_branches),
      canAddProduct: Number(row.usage_products) < Number(row.max_products),
      canInviteUser: Number(row.usage_users) < Number(row.max_users),
      canCreateCampaign: Number(row.usage_campaigns) < Number(row.max_campaigns),
    };
  }

  async updatePlanLimits(companyId: string, _limits: Partial<PlanLimitInfo>): Promise<PlanLimitInfo> {
    return this.findPlanLimits(companyId);
  }

  findAuditEventsByCompany(_companyId: string): Promise<AuditEvent[]> {
    return Promise.resolve([]);
  }

  recordAuditEvent(_companyId: string, event: AuditEvent): Promise<AuditEvent> {
    return Promise.resolve(event);
  }
}
