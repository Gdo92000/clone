import type { MerchantCompany, MerchantBranch, MerchantMenuItem, MerchantOrder, MerchantOrderStatus } from '../types';
import { merchantApi } from '../api';
import { companyListDtoToModel, branchListDtoToModel, menuItemDtoToModel, orderListDtoToModel } from '../mappers/merchantMapper';

export async function getCompanies(): Promise<MerchantCompany[]> {
  return merchantApi.getCompanies().then(companyListDtoToModel);
}

export async function getBranches(): Promise<MerchantBranch[]> {
  return merchantApi.getBranches().then(branchListDtoToModel);
}

export async function getBranchesByCompany(companyId: string): Promise<MerchantBranch[]> {
  return merchantApi.getBranchesByCompany(companyId).then(branchListDtoToModel);
}

export async function getMenuItems(): Promise<MerchantMenuItem[]> {
  return merchantApi.getMenuItems().then((dtos) => dtos.map(menuItemDtoToModel));
}

export async function getMenuItemsByBranch(branchId: string): Promise<MerchantMenuItem[]> {
  return merchantApi.getMenuItemsByBranch(branchId).then((dtos) => dtos.map(menuItemDtoToModel));
}

export async function getOrders(): Promise<MerchantOrder[]> {
  return merchantApi.getOrders().then(orderListDtoToModel);
}

export async function getOrdersByBranch(branchId: string): Promise<MerchantOrder[]> {
  return merchantApi.getOrdersByBranch(branchId).then(orderListDtoToModel);
}

export async function updateOrderStatus(orderId: string, newStatus: MerchantOrderStatus): Promise<void> {
  await merchantApi.updateOrderStatus(orderId, newStatus);
}

export async function getCoupons() {
  return merchantApi.getCoupons();
}