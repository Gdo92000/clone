import type { MerchantCompany, MerchantBranch, MerchantMenuItem, MerchantOrder, MerchantOrderStatus } from '../types';
import { merchantApi } from '../api';
import { companyListDtoToModel, branchListDtoToModel, branchDtoToModel, menuItemDtoToModel, orderListDtoToModel } from '../mappers/merchantMapper';
import type { CreateBranchRequest, UpdateBranchRequest } from '../dto/merchantDto';

export async function getCompanies(): Promise<MerchantCompany[]> {
  const dtos = await merchantApi.getCompanies();
  return companyListDtoToModel(dtos);
}

export async function getBranches(): Promise<MerchantBranch[]> {
  const dtos = await merchantApi.getBranches();
  return branchListDtoToModel(dtos);
}

export async function getBranchesByCompany(companyId: string): Promise<MerchantBranch[]> {
  const dtos = await merchantApi.getBranchesByCompany(companyId);
  return branchListDtoToModel(dtos);
}

export async function createBranch(data: CreateBranchRequest): Promise<MerchantBranch> {
  const dto = await merchantApi.createBranch(data);
  return branchDtoToModel(dto);
}

export async function updateBranch(id: string, data: UpdateBranchRequest): Promise<MerchantBranch> {
  const dto = await merchantApi.updateBranch(id, data);
  return branchDtoToModel(dto);
}

export async function deleteBranch(id: string): Promise<void> {
  await merchantApi.deleteBranch(id);
}

export async function getMenuItems(): Promise<MerchantMenuItem[]> {
  const dtos = await merchantApi.getMenuItems();
  return dtos.map(menuItemDtoToModel);
}

export async function getMenuItemsByBranch(branchId: string): Promise<MerchantMenuItem[]> {
  const dtos = await merchantApi.getMenuItemsByBranch(branchId);
  return dtos.map(menuItemDtoToModel);
}

export async function getOrders(): Promise<MerchantOrder[]> {
  const dtos = await merchantApi.getOrders();
  return orderListDtoToModel(dtos);
}

export async function getOrdersByBranch(branchId: string): Promise<MerchantOrder[]> {
  const dtos = await merchantApi.getOrdersByBranch(branchId);
  return orderListDtoToModel(dtos);
}

export async function updateOrderStatus(orderId: string, newStatus: MerchantOrderStatus): Promise<void> {
  await merchantApi.updateOrderStatus(orderId, newStatus);
}

export async function getCoupons() {
  return merchantApi.getCoupons();
}