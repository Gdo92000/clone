/* eslint-disable @typescript-eslint/require-await */
import type { IMerchantRepository, MerchantOrderFilter } from 'src/domain/repositories/IMerchantRepository';
import type { MerchantCompany, MerchantBranch, BranchSettings } from 'src/domain/entities/Company';
import type { MerchantOrder } from 'src/domain/entities/Order';
import type { MerchantCoupon, Campaign } from 'src/domain/entities/Coupon';
import { mockCompanies } from '../data/merchant-companies';
import { mockBranches } from '../data/merchant-branches';
import { mockOrders } from '../data/merchant-orders';
import { mockBranchSettings, mockCoupons, mockCampaigns } from '../data/merchant-coupons';

export class MemoryMerchantRepository implements IMerchantRepository {
  private companies = [...mockCompanies];
  private branches = [...mockBranches];
  private orders = [...mockOrders];
  private branchSettings = [...mockBranchSettings];
  private coupons = [...mockCoupons];
  private campaigns = [...mockCampaigns];

  async findMany(): Promise<MerchantCompany[]> {
    return this.companies;
  }

  async findById(id: string): Promise<MerchantCompany | null> {
    const found = this.companies.find(c => c.id === id);
    return found ?? null;
  }

  async findByIds(ids: string[]): Promise<MerchantCompany[]> {
    return this.companies.filter(c => ids.includes(c.id));
  }

  async create(data: Record<string, unknown>): Promise<MerchantCompany> {
    const item = { id: crypto.randomUUID(), ...data } as unknown as MerchantCompany;
    this.companies.push(item);
    return item;
  }

  async update(id: string, data: Partial<MerchantCompany>): Promise<MerchantCompany | null> {
    const found = this.companies.find(c => c.id === id);
    if (!found) return null;
    Object.assign(found, data);
    return found;
  }

  async remove(id: string): Promise<boolean> {
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.companies.splice(index, 1);
    return true;
  }

  async count(): Promise<number> {
    return this.companies.length;
  }

  async exists(id: string): Promise<boolean> {
    return this.companies.some(c => c.id === id);
  }

  async findBranchesByCompany(companyId: string): Promise<MerchantBranch[]> {
    return this.branches.filter(b => b.companyId === companyId);
  }

  async findBranchById(branchId: string): Promise<MerchantBranch | null> {
    const found = this.branches.find(b => b.id === branchId);
    return found ?? null;
  }

  async findSettingsByBranch(branchId: string): Promise<BranchSettings | null> {
    const found = this.branchSettings.find(s => s.branchId === branchId);
    return found ?? null;
  }

  async findOrders(filter?: MerchantOrderFilter): Promise<MerchantOrder[]> {
    let result = this.orders;
    if (filter?.branchId) result = result.filter(o => o.branchId === filter.branchId);
    if (filter?.status) result = result.filter(o => o.status === filter.status);
    return result;
  }

  async findOrdersByBranch(branchId: string): Promise<MerchantOrder[]> {
    return this.orders.filter(o => o.branchId === branchId);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<MerchantOrder | null> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;
    Object.assign(order, { status });
    return order;
  }

  async findCouponsByCompany(_companyId: string): Promise<MerchantCoupon[]> {
    return this.coupons;
  }

  async createCoupon(data: MerchantCoupon): Promise<MerchantCoupon> {
    this.coupons.push(data);
    return data;
  }

  async findCampaignsByCompany(_companyId: string): Promise<Campaign[]> {
    return this.campaigns;
  }

  async createCampaign(data: Campaign): Promise<Campaign> {
    this.campaigns.push(data);
    return data;
  }
}
