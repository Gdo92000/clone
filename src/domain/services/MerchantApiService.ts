import type {
  MerchantCompanyDTO,
  MerchantBranchDTO,
  MerchantMenuItemDTO,
  MerchantOrderDTO,
  BranchSettingsDTO,
} from '../../dto/merchantDto';
import type {
  MerchantCouponDTO,
  PrinterConfigDTO,
  PrintHistoryDTO,
  CampaignDTO,
  LoyaltySettingsDTO,
  LoyaltyRewardDTO,
} from '../../dto/superadminDto';
import type { MerchantOrderStatus } from '../../types';

interface MerchantApiClient {
  getCompanies: () => Promise<MerchantCompanyDTO[]>;
  getBranches: () => Promise<MerchantBranchDTO[]>;
  getBranchesByCompany: (companyId: string) => Promise<MerchantBranchDTO[]>;
  getMenuItems: () => Promise<MerchantMenuItemDTO[]>;
  getMenuItemsByBranch: (branchId: string) => Promise<MerchantMenuItemDTO[]>;
  getOrders: () => Promise<MerchantOrderDTO[]>;
  getOrdersByBranch: (branchId: string) => Promise<MerchantOrderDTO[]>;
  updateOrderStatus: (orderId: string, status: MerchantOrderStatus) => Promise<Record<string, never>>;
  getCoupons: () => Promise<MerchantCouponDTO[]>;
  getCouponsByBranch: (branchId: string) => Promise<MerchantCouponDTO[]>;
  createCoupon: (data: Record<string, unknown>) => Promise<MerchantCouponDTO>;
  updateCoupon: (id: string, data: Record<string, unknown>) => Promise<MerchantCouponDTO>;
  deleteCoupon: (id: string) => Promise<Record<string, never>>;
  getCampaigns: () => Promise<CampaignDTO[]>;
  createCampaign: (data: Record<string, unknown>) => Promise<CampaignDTO>;
  updateCampaign: (id: string, data: Record<string, unknown>) => Promise<CampaignDTO>;
  deleteCampaign: (id: string) => Promise<Record<string, never>>;
  getSettingsByBranch: (branchId: string) => Promise<BranchSettingsDTO | Record<string, never>>;
  updateSettings: (branchId: string, data: Partial<BranchSettingsDTO>) => Promise<Record<string, never>>;
  getLoyaltySettings: (branchId: string) => Promise<LoyaltySettingsDTO>;
  updateLoyaltySettings: (branchId: string, data: Record<string, unknown>) => Promise<Record<string, never>>;
  getLoyaltyRewards: (branchId: string) => Promise<LoyaltyRewardDTO[]>;
  createLoyaltyReward: (data: Record<string, unknown>) => Promise<LoyaltyRewardDTO>;
  updateLoyaltyReward: (id: string, data: Record<string, unknown>) => Promise<LoyaltyRewardDTO>;
  deleteLoyaltyReward: (id: string) => Promise<Record<string, never>>;
  getPrinterConfig: (branchId: string) => Promise<PrinterConfigDTO>;
  savePrinterConfig: (branchId: string, data: Record<string, unknown>) => Promise<Record<string, never>>;
  getPrintHistory: (branchId: string) => Promise<PrintHistoryDTO[]>;
}

export class MerchantApiService {
  constructor(private readonly api: MerchantApiClient) {}

  async getCompanies(): Promise<MerchantCompanyDTO[]> {
    return this.api.getCompanies();
  }

  async getBranches(): Promise<MerchantBranchDTO[]> {
    return this.api.getBranches();
  }

  async getBranchesByCompany(companyId: string): Promise<MerchantBranchDTO[]> {
    return this.api.getBranchesByCompany(companyId);
  }

  async getMenuItems(): Promise<MerchantMenuItemDTO[]> {
    return this.api.getMenuItems();
  }

  async getMenuItemsByBranch(branchId: string): Promise<MerchantMenuItemDTO[]> {
    return this.api.getMenuItemsByBranch(branchId);
  }

  async getOrders(): Promise<MerchantOrderDTO[]> {
    return this.api.getOrders();
  }

  async getOrdersByBranch(branchId: string): Promise<MerchantOrderDTO[]> {
    return this.api.getOrdersByBranch(branchId);
  }

  async updateOrderStatus(orderId: string, status: MerchantOrderStatus): Promise<void> {
    await this.api.updateOrderStatus(orderId, status);
  }

  async getCoupons(): Promise<MerchantCouponDTO[]> {
    return this.api.getCoupons();
  }

  async getCouponsByBranch(branchId: string): Promise<MerchantCouponDTO[]> {
    return this.api.getCouponsByBranch(branchId);
  }

  async createCoupon(data: Record<string, unknown>): Promise<MerchantCouponDTO> {
    return this.api.createCoupon(data);
  }

  async updateCoupon(id: string, data: Record<string, unknown>): Promise<MerchantCouponDTO> {
    return this.api.updateCoupon(id, data);
  }

  async deleteCoupon(id: string): Promise<void> {
    await this.api.deleteCoupon(id);
  }

  async getCampaigns(): Promise<CampaignDTO[]> {
    return this.api.getCampaigns();
  }

  async createCampaign(data: Record<string, unknown>): Promise<CampaignDTO> {
    return this.api.createCampaign(data);
  }

  async updateCampaign(id: string, data: Record<string, unknown>): Promise<CampaignDTO> {
    return this.api.updateCampaign(id, data);
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.api.deleteCampaign(id);
  }

  async getSettingsByBranch(branchId: string): Promise<BranchSettingsDTO | Record<string, never>> {
    return this.api.getSettingsByBranch(branchId);
  }

  async updateSettings(branchId: string, data: Partial<BranchSettingsDTO>): Promise<void> {
    await this.api.updateSettings(branchId, data);
  }

  async getLoyaltySettings(branchId: string): Promise<LoyaltySettingsDTO> {
    return this.api.getLoyaltySettings(branchId);
  }

  async updateLoyaltySettings(branchId: string, data: Record<string, unknown>): Promise<void> {
    await this.api.updateLoyaltySettings(branchId, data);
  }

  async getLoyaltyRewards(branchId: string): Promise<LoyaltyRewardDTO[]> {
    return this.api.getLoyaltyRewards(branchId);
  }

  async createLoyaltyReward(data: Record<string, unknown>): Promise<LoyaltyRewardDTO> {
    return this.api.createLoyaltyReward(data);
  }

  async updateLoyaltyReward(id: string, data: Record<string, unknown>): Promise<LoyaltyRewardDTO> {
    return this.api.updateLoyaltyReward(id, data);
  }

  async deleteLoyaltyReward(id: string): Promise<void> {
    await this.api.deleteLoyaltyReward(id);
  }

  async getPrinterConfig(branchId: string): Promise<PrinterConfigDTO> {
    return this.api.getPrinterConfig(branchId);
  }

  async savePrinterConfig(branchId: string, data: Partial<PrinterConfigDTO>): Promise<void> {
    await this.api.savePrinterConfig(branchId, data);
  }

  async getPrintHistory(branchId: string): Promise<PrintHistoryDTO[]> {
    return this.api.getPrintHistory(branchId);
  }
}
