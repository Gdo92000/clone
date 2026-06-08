import type { LoyaltySettings, LoyaltyReward } from 'src/domain/entities/Loyalty';

export const mockLoyaltySettings: LoyaltySettings = {
  id: 'ls-1',
  restaurantId: 'rest-1',
  pointsPerOrder: 0,
  pointsPerMoney: 10,
  minimumPoints: 100,
  rewardValue: 5,
  isActive: true,
};

export const mockLoyaltyRewards: LoyaltyReward[] = [
  { id: 'reward-1', userId: 'user-5', points: 500, description: 'Desconto de R$ 5', expiresAt: '', createdAt: new Date().toISOString() },
  { id: 'reward-2', userId: 'user-5', points: 1000, description: 'Desconto de 10%', expiresAt: '', createdAt: new Date().toISOString() },
  { id: 'reward-3', userId: 'user-5', points: 2000, description: 'Hambúrguer Grátis', expiresAt: '', createdAt: new Date().toISOString() },
];
