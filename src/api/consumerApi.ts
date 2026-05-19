import { get, post, put } from './httpClient';

export interface ReviewInput {
  restaurant_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
}

export const consumerApi = {
  createReview: (data: ReviewInput) => post<{ id: string }>('/reviews', data),
  getReviews: (restaurantId?: string) => get<any[]>(restaurantId ? `/reviews?restaurant_id=${restaurantId}` : '/reviews'),
  getMyOrders: () => get<any[]>('/me/orders'),
  createSupportTicket: (data: { title: string; message: string }) => post<{ id: string }>('/support-tickets', data),
  getMyTickets: () => get<any[]>('/support-tickets'),
  getMyNotifications: () => get<any[]>('/me/notifications'),
  markNotificationRead: (id: string) => put<{ success: boolean }>(`/me/notifications/${id}/read`),
  markAllNotificationsRead: () => put<{ success: boolean }>('/me/notifications/read-all'),
};
