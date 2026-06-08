export interface Coordinates {
  latitude: number;
  longitude: number;
}

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
  coordinates?: Coordinates;
  deliveryRadiusKm: number;
}

export interface BranchSettings {
  branchId: string;
  openingTime: string;
  closingTime: string;
  preparationTime: number;
  minimumOrder: number;
  acceptsDelivery: boolean;
  acceptsPickup: boolean;
  pixKey: string;
}
