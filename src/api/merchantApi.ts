import { get, post } from './httpClient';
import type { MerchantCompanyDTO, MerchantBranchDTO, MerchantMenuItemDTO, MerchantOrderDTO } from '../dto/merchantDto';
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
};