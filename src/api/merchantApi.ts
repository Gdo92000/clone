import { get, post, put, del } from './httpClient';
import type { MerchantCompanyDTO, MerchantBranchDTO, MerchantMenuItemDTO, MerchantOrderDTO, BranchSettingsDTO }
  from '../dto/merchantDto';
import type { MerchantOrderStatus } from '../types';
import type { PrinterConfigDTO, PrintHistoryDTO, MerchantCouponDTO, CampaignDTO, LoyaltySettingsDTO, LoyaltyRewardDTO } from '../dto/superadminDto';

export const merchantApi = {
  getCompanies: () => get<MerchantCompanyDTO[]>('/companies'),
  getBranches: () => get<MerchantBranchDTO[]>('/branches'),
  getBranchesByCompany: (companyId: string) => get<MerchantBranchDTO[]>(`/companies/${companyId}/branches`),
  getMenuItems: () => get<MerchantMenuItemDTO[]>('/menu-items'),
  getMenuItemsByBranch: (branchId: string) => get<MerchantMenuItemDTO[]>(`/branches/${branchId}/menu-items`),
  getOrders: () => get<MerchantOrderDTO[]>('/orders'),
  getOrdersByBranch: (branchId: string) => get<MerchantOrderDTO[]>(`/branches/${branchId}/orders`),
  updateOrderStatus: (orderId: string, status: MerchantOrderStatus) =>
    post<Record<string, never>>(`/orders/${orderId}/status`, { status }),
  getCoupons: () => get<MerchantCouponDTO[]>('/merchant-coupons'),
  getCouponsByBranch: (branchId: string) => get<MerchantCouponDTO[]>(`/merchant-coupons?branch_id=${branchId}`),
  createCoupon: (data: Record<string, unknown>) => post<MerchantCouponDTO>('/merchant-coupons', data),
  updateCoupon: (id: string, data: Record<string, unknown>) => put<MerchantCouponDTO>(`/merchant-coupons/${id}`, data),
  deleteCoupon: (id: string) => del<Record<string, never>>(`/merchant-coupons/${id}`),
  getCampaigns: () => get<CampaignDTO[]>('/campaigns'),
  createCampaign: (data: Record<string, unknown>) => post<CampaignDTO>('/campaigns', data),
  updateCampaign: (id: string, data: Record<string, unknown>) => put<CampaignDTO>(`/campaigns/${id}`, data),
  deleteCampaign:          (id: string) => del<Record<string, never>>(`/campaigns/${id}`),
  getSettingsByBranch:     (branchId: string) => get<BranchSettingsDTO | Record<string, never>>(`/branch-settings/${branchId}`),
  updateSettings:          (branchId: string, data: Partial<BranchSettingsDTO>) => put<Record<string, never>>(`/branch-settings/${branchId}`, data),
  getLoyaltySettings:         (branchId: string) => get<LoyaltySettingsDTO>(`/loyalty/settings/${branchId}`),
  updateLoyaltySettings:      (branchId: string, data: Record<string, unknown>) => put<Record<string, never>>(`/loyalty/settings/${branchId}`, data),
  getLoyaltyRewards:          (branchId: string) => get<LoyaltyRewardDTO[]>(`/loyalty/rewards/${branchId}`),
  createLoyaltyReward:        (data: Record<string, unknown>) => post<LoyaltyRewardDTO>('/loyalty/rewards', data),
  updateLoyaltyReward:        (id: string, data: Record<string, unknown>) => put<LoyaltyRewardDTO>(`/loyalty/rewards/${id}`, data),
  deleteLoyaltyReward:        (id: string) => del<Record<string, never>>(`/loyalty/rewards/${id}`),
  getPrinterConfig:           (branchId: string) => get<PrinterConfigDTO>(`/printing/config/${branchId}`),
  savePrinterConfig:          (branchId: string, data: Record<string, unknown>) => put<Record<string, never>>(`/printing/config/${branchId}`, data),
  getPrintHistory:            (branchId: string) => get<PrintHistoryDTO[]>(`/printing/history/${branchId}`),
};
