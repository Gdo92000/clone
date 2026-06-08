export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Capability {
  featureKey: string;
  name: string;
  description: string;
  monthlyPrice: number;
  dependencies: string[];
  category: string;
  requiredPlan: string;
  chargeType: 'monthly' | 'per_request' | 'one_time';
  relatedLimits: string[];
}
