import type { MerchantOrder } from 'src/domain/entities/Order';
import type { MerchantCoupon, Campaign } from 'src/domain/entities/Coupon';
import type { MerchantCompany, MerchantBranch, BranchSettings } from 'src/domain/entities/Company';
import type { RepositoryPort, RepositoryFilter } from './RepositoryPort';

export type MerchantOrderFilter = RepositoryFilter<MerchantOrder> & {
  branchId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export interface IMerchantRepository extends RepositoryPort<MerchantCompany> {
  findBranchesByCompany(companyId: string): Promise<MerchantBranch[]>;
  findBranchById(branchId: string): Promise<MerchantBranch | null>;
  findSettingsByBranch(branchId: string): Promise<BranchSettings | null>;

  findOrders(filter?: MerchantOrderFilter): Promise<MerchantOrder[]>;
  findOrdersByBranch(branchId: string): Promise<MerchantOrder[]>;
  updateOrderStatus(orderId: string, status: string): Promise<MerchantOrder | null>;

  findCouponsByCompany(companyId: string): Promise<MerchantCoupon[]>;
  createCoupon(data: MerchantCoupon): Promise<MerchantCoupon>;

  findCampaignsByCompany(companyId: string): Promise<Campaign[]>;
  createCampaign(data: Campaign): Promise<Campaign>;
}
