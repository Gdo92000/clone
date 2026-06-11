export type MerchantOrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'rejected';

export interface MerchantCompany {
  id: string;
  name: string;
  document: string;
  plan: string;
}

export interface MerchantBranch {
  id: string;
  companyId: string;
  name: string;
  cep: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  deliveryRadiusKm: number;
}

export interface MerchantMenuItem {
  id: string;
  branchId: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  isVisibleToConsumer: boolean;
  description: string;
}

export interface MerchantOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface MerchantOrder {
  id: string;
  branchId: string;
  customerName: string;
  customerAddress: string;
  createdAt: string;
  status: MerchantOrderStatus;
  paymentMethod: string;
  deliveryType: 'delivery' | 'pickup';
  total: number;
  items: MerchantOrderItem[];
}

export interface MerchantCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxUses: number;
  currentUses: number;
  validUntil: string;
  isActive: boolean;
}