export interface MerchantCompanyDTO {
  id: string;
  name: string;
  document: string;
  plan: string;
}

export interface MerchantBranchDTO {
  id: string;
  company_id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  delivery_radius_km: number;
}

export interface MerchantMenuItemDTO {
  id: string;
  branch_id: string;
  name: string;
  category: string;
  price: number;
  is_available: boolean;
  description: string;
}

export interface MerchantOrderDTO {
  id: string;
  branch_id: string;
  customer_name: string;
  customer_address: string;
  created_at: string;
  status: string;
  payment_method: string;
  delivery_type: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
}