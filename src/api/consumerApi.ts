import { get, post, put } from './httpClient';
import type {
  ConsumerNotificationDTO,
  ConsumerLoyaltyDTO,
  ConsumerOrderDTO,
  SupportTicketDTO,
  ReviewDTO,
} from '../dto/superadminDto';

export interface ReviewInput {
  restaurant_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
}

export interface CreateTicketInput {
  subject: string;
  description?: string;
  priority?: string;
}

export const consumerApi = {
  getMyNotifications: () => get<ConsumerNotificationDTO[]>('/me/notifications'),
  markNotificationRead: (id: string) => put<Record<string, never>>(`/me/notifications/${id}/read`),
  markAllNotificationsRead: () => put<Record<string, never>>('/me/notifications/read-all'),
  getMyLoyalty: (branchId: string) => get<ConsumerLoyaltyDTO>(`/loyalty/me/loyalty?branch_id=${branchId}`),
  redeemLoyaltyReward: (data: { rewardId: string; branchId: string }) => post<Record<string, unknown>>('/loyalty/me/loyalty/redeem', data),
  getMyOrders: () => get<ConsumerOrderDTO[]>('/me/orders'),
  getMyTickets: () => get<SupportTicketDTO[]>('/me/tickets'),
  getMyReviews: () => get<ReviewDTO[]>('/me/reviews'),
  createTicket: (data: CreateTicketInput) => post<SupportTicketDTO>('/me/tickets', data),
};
