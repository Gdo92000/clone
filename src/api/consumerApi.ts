import { get, post, put } from './httpClient';
import type {
  ConsumerNotificationDTO,
  ConsumerLoyaltyDTO,
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

export interface OrderItemInput {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  additives?: unknown;
  notes?: string;
}

export interface CreateOrderInput {
  restaurant_id: string;
  delivery_type?: 'delivery' | 'pickup';
  payment_method: 'credit' | 'debit' | 'pix' | 'cash' | 'meal_ticket';
  address_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_address: string;
  subtotal: number;
  delivery_fee?: number;
  discount?: number;
  total: number;
  notes?: string;
  estimated_time?: string;
  items: OrderItemInput[];
}

export interface CreateOrderResponse {
  id: string;
  status: string;
  total: string;
  restaurant_id: string;
  created_at: string | Date;
  items: { id: string; name: string; quantity: number; price: string }[];
}

export interface OrderAddressDTO {
  street: string;
  number: string;
  neighborhood: string | null;
  city: string;
  state: string;
  zip_code: string | null;
}

export interface OrderCustomerDTO {
  name: string;
  phone: string | null;
}

export interface OrderDTO {
  id: string;
  user_id: string;
  restaurant_id: string;
  status: string;
  delivery_type: string;
  payment_method: string;
  address_id: string | null;
  subtotal: string;
  delivery_fee: string;
  discount: string;
  total: string;
  notes: string | null;
  estimated_time: string | null;
  created_at: string;
  updated_at: string;
  restaurant_name: string | null;
  restaurant_image: string | null;
}

export interface OrderDetailResponse {
  order: OrderDTO;
  items: { id: string; menu_item_id: string; name: string; quantity: number; price: string; additives: unknown; notes: string | null }[];
  address: OrderAddressDTO | null;
  customer: OrderCustomerDTO | null;
}

export const consumerApi = {
  getMyNotifications: () => get<ConsumerNotificationDTO[]>('/me/notifications'),
  markNotificationRead: (id: string) => put<Record<string, never>>(`/me/notifications/${id}/read`),
  markAllNotificationsRead: () => put<Record<string, never>>('/me/notifications/read-all'),
  getMyLoyalty: (branchId: string) => get<ConsumerLoyaltyDTO>(`/loyalty/me/loyalty?branch_id=${branchId}`),
  redeemLoyaltyReward: (data: { rewardId: string; branchId: string }) => post<Record<string, unknown>>('/loyalty/me/loyalty/redeem', data),
  getMyOrders: () => get<OrderDTO[]>('/me/orders'),
  getMyTickets: () => get<SupportTicketDTO[]>('/support-tickets'),
  getMyReviews: () => get<ReviewDTO[]>('/reviews'),
  createTicket: (data: CreateTicketInput) => post<SupportTicketDTO>('/support-tickets', data),
  createOrder: (data: CreateOrderInput) => post<CreateOrderResponse>('/me/orders', data),
  getOrder: (id: string) => get<OrderDetailResponse>(`/me/orders/${id}`),
};
