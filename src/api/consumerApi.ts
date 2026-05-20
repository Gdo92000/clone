import { get, post, put } from './httpClient';

export interface ReviewInput {
  restaurant_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
}

export const consumerApi = {
  // ... existing methods ...
  getMyNotifications: () => get<any[]>('/me/notifications'),
  markNotificationRead: (id: string) => put<void>(`/me/notifications/${id}/read`),
  markAllNotificationsRead: () => put<void>('/me/notifications/read-all'),
  getMyLoyalty: (branchId: string) => get<any>(`/loyalty/me/loyalty?branch_id=${branchId}`),
  redeemLoyaltyReward: (data: { rewardId: string; branchId: string }) => post<any>('/loyalty/me/loyalty/redeem', data),
  getMyOrders: () => get<any[]>('/me/orders'),
};
