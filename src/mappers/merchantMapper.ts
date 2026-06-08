import type { MerchantBranch, MerchantCompany, MerchantMenuItem, MerchantOrder, MerchantOrderStatus } from '../types';
import type { MerchantBranchDTO, MerchantCompanyDTO, MerchantMenuItemDTO, MerchantOrderDTO } from '../dto/merchantDto';
import { coerceNumeric, coerceNumericOrZero } from '../utils/format';

export function companyDtoToModel(dto: MerchantCompanyDTO): MerchantCompany {
  return { id: dto.id, name: dto.name, document: dto.document, plan: dto.plan };
}

export function branchDtoToModel(dto: MerchantBranchDTO): MerchantBranch {
  const latitude = coerceNumeric(dto.latitude);
  const longitude = coerceNumeric(dto.longitude);
  return {
    id: dto.id,
    companyId: dto.company_id,
    name: dto.name,
    cep: dto.cep ?? '',
    address: dto.address,
    number: dto.number ?? '',
    neighborhood: dto.neighborhood,
    city: dto.city,
    state: dto.state,
    deliveryRadiusKm: coerceNumericOrZero(dto.delivery_radius_km),
    ...(latitude !== null && longitude !== null
      ? { coordinates: { lat: latitude, lng: longitude } }
      : {}),
  };
}

export function menuItemDtoToModel(dto: MerchantMenuItemDTO): MerchantMenuItem {
  return {
    id: dto.id,
    branchId: dto.branch_id,
    name: dto.name,
    category: dto.category,
    price: coerceNumericOrZero(dto.price),
    isAvailable: dto.is_available,
    description: dto.description,
  };
}

export function orderDtoToModel(dto: MerchantOrderDTO): MerchantOrder {
  return {
    id: dto.id,
    branchId: dto.branch_id,
    customerName: dto.customer_name,
    customerAddress: dto.customer_address,
    createdAt: dto.created_at,
    status: dto.status as MerchantOrderStatus,
    paymentMethod: dto.payment_method,
    deliveryType: dto.delivery_type as 'delivery' | 'pickup',
    total: coerceNumericOrZero(dto.total),
    items: dto.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: coerceNumericOrZero(item.price),
    })),
  };
}

/* Batch converters */
export function companyListDtoToModel(dtos: MerchantCompanyDTO[]): MerchantCompany[] {
  return dtos.map(companyDtoToModel);
}

export function branchListDtoToModel(dtos: MerchantBranchDTO[]): MerchantBranch[] {
  return dtos.map(branchDtoToModel);
}

export function orderListDtoToModel(dtos: MerchantOrderDTO[]): MerchantOrder[] {
  return dtos.map(orderDtoToModel);
}