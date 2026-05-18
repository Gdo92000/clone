export interface DemoCategory {
  id: string;
  name: string;
  cuisine: string;
  imageUrl: string;
  tags: string[];
}

export interface DemoCompanyProfile {
  companyId: string;
  logoUrl: string;
  bannerUrl: string;
  commercialStatus: 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled';
}

export interface DemoProductOption {
  id: string;
  name: string;
  min: number;
  max: number;
  values: { id: string; name: string; priceDelta: number }[];
}

export interface DemoProduct {
  id: string;
  branchId: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  available: boolean;
  tags: string[];
  options: DemoProductOption[];
}

export interface DemoCustomer {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  target: string;
  createdAt: string;
}
