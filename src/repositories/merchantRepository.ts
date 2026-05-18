import type { MerchantCompany, MerchantBranch, MerchantMenuItem, MerchantOrder, MerchantOrderStatus } from '../types';
import { merchantApi } from '../api';
import { companyListDtoToModel, branchListDtoToModel, menuItemDtoToModel, orderListDtoToModel } from '../mappers/merchantMapper';

const useMock = __USE_MOCK__;

export async function getCompanies(): Promise<MerchantCompany[]> {
  if (useMock) {
    const { merchantCompanies } = await import('../modules/merchant/merchantData');
    return merchantCompanies;
  }
  return merchantApi.getCompanies().then(companyListDtoToModel);
}

export async function getBranches(): Promise<MerchantBranch[]> {
  if (useMock) {
    const { merchantBranches } = await import('../modules/merchant/merchantData');
    return merchantBranches;
  }
  return merchantApi.getBranches().then(branchListDtoToModel);
}

export async function getBranchesByCompany(companyId: string): Promise<MerchantBranch[]> {
  if (useMock) {
    const { merchantBranches } = await import('../modules/merchant/merchantData');
    return merchantBranches.filter((b) => b.companyId === companyId);
  }
  return merchantApi.getBranchesByCompany(companyId).then(branchListDtoToModel);
}

export async function getMenuItems(): Promise<MerchantMenuItem[]> {
  if (useMock) {
    const { merchantMenuItems } = await import('../modules/merchant/merchantData');
    return merchantMenuItems;
  }
  return merchantApi.getMenuItems().then((dtos) => dtos.map(menuItemDtoToModel));
}

export async function getMenuItemsByBranch(branchId: string): Promise<MerchantMenuItem[]> {
  if (useMock) {
    const { merchantMenuItems } = await import('../modules/merchant/merchantData');
    return merchantMenuItems.filter((i) => i.branchId === branchId);
  }
  return merchantApi.getMenuItemsByBranch(branchId).then((dtos) => dtos.map(menuItemDtoToModel));
}

export async function getOrders(): Promise<MerchantOrder[]> {
  if (useMock) {
    const { merchantOrders } = await import('../modules/merchant/merchantData');
    return merchantOrders;
  }
  return merchantApi.getOrders().then(orderListDtoToModel);
}

export async function getOrdersByBranch(branchId: string): Promise<MerchantOrder[]> {
  if (useMock) {
    const { merchantOrders } = await import('../modules/merchant/merchantData');
    return merchantOrders.filter((o) => o.branchId === branchId);
  }
  return merchantApi.getOrdersByBranch(branchId).then(orderListDtoToModel);
}

export async function updateOrderStatus(orderId: string, newStatus: MerchantOrderStatus): Promise<void> {
  if (useMock) {
    const { merchantOrders } = await import('../modules/merchant/merchantData');
    const order = merchantOrders.find((o) => o.id === orderId);
    if (order) {
      // Note: In a real app, we would update the data, but since this is mock data
      // imported as a const, we can't actually modify it. 
      // For the mock to work with state updates, we rely on the repositories being 
      // re-called to get fresh data, or on frontend state management.
      // This is a limitation of the mock approach - in practice, the frontend 
      // should handle optimistic updates.
    }
    return;
  }
  await merchantApi.updateOrderStatus(orderId, newStatus);
}

export async function getCoupons() {
  if (__USE_MOCK__) {
    const { merchantCoupons } = await import('../modules/merchant/merchantData');
    return merchantCoupons;
  }
  return []; // no coupons API yet
}


// Mock exports removed to enable tree-shaking - data is now imported dynamically
// when __USE_MOCK__ is true, allowing bundlers to eliminate merchantData.ts
// from production bundles when VITE_MOCK=false