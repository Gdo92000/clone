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
  cep: string | null;
  address: string;
  number: string | null;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  delivery_radius_km: number;
}

export interface CreateBranchRequest {
  company_id: string;
  name: string;
  cep?: string | null;
  address: string;
  number?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  delivery_radius_km?: number;
}

export type UpdateBranchRequest = Partial<Omit<CreateBranchRequest, 'company_id'>>;

export interface MerchantMenuItemDTO {
  id: string;
  branch_id: string;
  name: string;
  category: string;
  price: number;
  is_available: boolean;
  description: string;
}

export interface BranchSettingsDTO {
  branch_id: string;
  opening_time: string;
  closing_time: string;
  preparation_time: string;
  minimum_order: string;
  accepts_delivery: boolean;
  accepts_pickup: boolean;
  pix_key: string;
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