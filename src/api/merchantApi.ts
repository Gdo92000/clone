import { get, post, put, del } from './httpClient';
import type { MerchantCompanyDTO, MerchantBranchDTO, MerchantMenuItemDTO, MerchantOrderDTO, BranchSettingsDTO }
  from '../dto/merchantDto';
import type { MerchantOrderStatus } from '../types';
export const merchantApi = {
  getCompanies: () => get<MerchantCompanyDTO[]>('/companies'),
  getBranches: () => get<MerchantBranchDTO[]>('/branches'),
  getBranchesByCompany: (companyId: string) => get<MerchantBranchDTO[]>(`/companies/${companyId}/branches`),
  getMenuItems: () => get<MerchantMenuItemDTO[]>('/menu-items'),
  getMenuItemsByBranch: (branchId: string) => get<MerchantMenuItemDTO[]>(`/branches/${branchId}/menu-items`),
  getOrders: () => get<MerchantOrderDTO[]>('/orders'),
  getOrdersByBranch: (branchId: string) => get<MerchantOrderDTO[]>(`/branches/${branchId}/orders`),
  updateOrderStatus: (orderId: string, status: MerchantOrderStatus) =>
    post<void>(`/orders/${orderId}/status`, { status }),
  getCoupons: () => get<any[]>('/merchant-coupons'),
  getCouponsByBranch: (branchId: string) => get<any[]>(`/merchant-coupons?branch_id=${branchId}`),
  createCoupon: (data: any) => post<any>('/merchant-coupons', data),
  updateCoupon: (id: string, data: any) => put<any>(`/merchant-coupons/${id}`, data),
  deleteCoupon: (id: string) => del<void>(`/merchant-coupons/${id}`),
  getCampaigns: () => get<any[]>('/campaigns'),
  createCampaign: (data: any) => post<any>('/campaigns', data),
  updateCampaign: (id: string, data: any) => put<any>(`/campaigns/${id}`, data),
  deleteCampaign:          (id: string) => del<void>(`/campaigns/${id}`),
  getSettingsByBranch:     (branchId: string) => get<BranchSettingsDTO | Record<string, never>>(`/branch-settings/${branchId}`),
  updateSettings:          (branchId: string, data: Partial<BranchSettingsDTO>) => put<void>(`/branch-settings/${branchId}`, data),
};