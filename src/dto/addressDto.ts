export interface AddressDTO {
  id: string;
  user_id: string;
  label: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
}

export interface CreateAddressRequest {
  label?: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  zip_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>;
