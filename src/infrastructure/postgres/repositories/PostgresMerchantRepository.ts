import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import type { IMerchantRepository, MerchantOrderFilter } from 'src/domain/repositories/IMerchantRepository';
import type { MerchantCompany, MerchantBranch, BranchSettings } from 'src/domain/entities/Company';
import type { MerchantOrder } from 'src/domain/entities/Order';
import type { MerchantCoupon, Campaign } from 'src/domain/entities/Coupon';
import { companies, branches, branchSettings, merchantOrders } from 'server/src/db/schema/merchant';
import { merchantCoupons, campaigns } from 'server/src/db/schema/commerce';
import { fromDbRows, fromDbRow, toDbInput } from '../helpers';

export class PostgresMerchantRepository implements IMerchantRepository {
  constructor(private readonly _db: PostgresJsDatabase) {}

  async findMany(): Promise<MerchantCompany[]> {
    const rows = await this._db.select().from(companies);
    return fromDbRows<MerchantCompany>(rows);
  }

  async findById(id: string): Promise<MerchantCompany | null> {
    const rows = await this._db.select().from(companies).where(eq(companies.id, id)).limit(1);
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as MerchantCompany;
  }

  async findByIds(ids: string[]): Promise<MerchantCompany[]> {
    if (ids.length === 0) return [];
    const rows = await this._db.select().from(companies);
    return fromDbRows<MerchantCompany>(rows.filter((r) => ids.includes(r.id)));
  }

  async create(data: Record<string, unknown>): Promise<MerchantCompany> {
    const rows = await this._db.insert(companies).values(        toDbInput(data) as typeof companies.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as MerchantCompany;
  }

  async update(id: string, data: Partial<MerchantCompany>): Promise<MerchantCompany | null> {
    const rows = await this._db.update(companies).set(        toDbInput(data) as Partial<typeof companies.$inferInsert>).where(eq(companies.id, id)).returning();
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as MerchantCompany;
  }

  async remove(id: string): Promise<boolean> {
    await this._db.delete(companies).where(eq(companies.id, id));
    return true;
  }

  async count(): Promise<number> {
    const rows = await this._db.select().from(companies);
    return rows.length;
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.findById(id);
    return row !== null;
  }

  async findBranchesByCompany(companyId: string): Promise<MerchantBranch[]> {
    const rows = await this._db.select().from(branches).where(eq(branches.company_id, companyId));
    return fromDbRows<MerchantBranch>(rows);
  }

  async findBranchById(branchId: string): Promise<MerchantBranch | null> {
    const rows = await this._db.select().from(branches).where(eq(branches.id, branchId)).limit(1);
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as MerchantBranch;
  }

  async findSettingsByBranch(branchId: string): Promise<BranchSettings | null> {
    const rows = await this._db.select().from(branchSettings).where(eq(branchSettings.branch_id, branchId)).limit(1);
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as BranchSettings;
  }

  async findOrders(filter?: MerchantOrderFilter): Promise<MerchantOrder[]> {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filter?.branchId) conditions.push(eq(merchantOrders.branch_id, filter.branchId));
    if (filter?.status) conditions.push(eq(merchantOrders.status, filter.status as 'new' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'rejected'));
    const rows = conditions.length > 0
      ? await this._db.select().from(merchantOrders).where(and(...conditions))
      : await this._db.select().from(merchantOrders);
    return fromDbRows<MerchantOrder>(rows);
  }

  async findOrdersByBranch(branchId: string): Promise<MerchantOrder[]> {
    return this.findOrders({ branchId });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<MerchantOrder | null> {
    const typedStatus = status as 'new' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'rejected';
    const rows = await this._db.update(merchantOrders).set({ status: typedStatus }).where(eq(merchantOrders.id, orderId)).returning();
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as MerchantOrder;
  }

  async findCouponsByCompany(companyId: string): Promise<MerchantCoupon[]> {
    const rows = await this._db.select().from(merchantCoupons);
    return fromDbRows<MerchantCoupon>(rows.filter((r) => r.id === companyId));
  }

  async createCoupon(data: MerchantCoupon): Promise<MerchantCoupon> {
    const rows = await this._db.insert(merchantCoupons).values(        toDbInput(data) as typeof merchantCoupons.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as MerchantCoupon;
  }

  async findCampaignsByCompany(companyId: string): Promise<Campaign[]> {
    const rows = await this._db.select().from(campaigns);
    return fromDbRows<Campaign>(rows.filter((r) => r.id === companyId));
  }

  async createCampaign(data: Campaign): Promise<Campaign> {
    const rows = await this._db.insert(campaigns).values(        toDbInput(data) as typeof campaigns.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as Campaign;
  }
}
