export interface LoyaltySettings {
  id: string;
  restaurantId: string;
  pointsPerOrder: number;
  pointsPerMoney: number;
  minimumPoints: number;
  rewardValue: number;
  isActive: boolean;
}

export interface LoyaltyReward {
  id: string;
  userId: string;
  points: number;
  description: string;
  expiresAt: string;
  createdAt: string;
}

export interface CustomerLoyalty {
  userId: string;
  points: number;
  totalPoints: number;
  tier: string;
}
