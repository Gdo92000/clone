export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface AuditEventDTO {
  id: string;
  user_id: string;
  action: string;
  details: string;
  ip: string;
  created_at: string;
}

export interface SupportTicketDTO {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  assigned_to?: string;
}

export interface FeatureFlagDTO {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  description: string;
}

export interface GlobalCouponDTO {
  id: string;
  code: string;
  discount: number;
  discount_type: string;
  min_order: number;
  max_uses: number;
  current_uses: number;
  active: boolean;
  expires_at: string;
}

export interface PermissionDTO {
  id: string;
  role: string;
  resource: string;
  action: string;
  name: string;
}

export interface CapabilityDTO {
  id: string;
  feature_key: string;
  name: string;
  description: string;
  category: string;
  charge_type: string;
  required_plan: string;
  monthly_price?: string;
}

export interface CommissionPlanDTO {
  plan_id: string;
  marketplace_fee: string;
  delivery_fee: string;
  payment_fee: string;
  additional_fees: { label: string; percentage: number }[];
}

export interface PlatformMetricsDTO {
  totalOrders: number;
  totalRevenue: string;
  avgTicket: number;
  activeStores: number;
  deliveryPercent: number;
  takeoutPercent: number;
}

export interface LoyaltySettingsDTO {
  branch_id: string;
  points_per_currency: number;
  currency_per_point: number;
  min_points_to_redeem: number;
  enabled: boolean;
}

export interface LoyaltyRewardDTO {
  id: string;
  branch_id: string;
  name: string;
  points_required: number;
  discount_type: string;
  discount_value: number;
  active: boolean;
}

export interface ConsumerNotificationDTO {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface ConsumerOrderDTO {
  id: string;
  branch_id: string;
  customer_name: string;
  status: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
  created_at: string;
}

export interface ConsumerLoyaltyDTO {
  user_id: string;
  branch_id: string;
  balance: number;
  points_per_real: string;
  rewards: Array<{
    id: string;
    name: string;
    points_required: number;
    discount_type: string;
    discount_value: number;
  }>;
}

export interface PrinterConfigDTO {
  printer_type: string;
  ip_address: string;
  port: number;
  model: string;
  enabled: boolean;
}

export interface PrintHistoryDTO {
  id: string;
  order_id: string;
  status: string;
  created_at: string;
}

export interface SubscriptionPlanDTO {
  id: string;
  name: string;
  monthly_price: string;
  description: string;
  max_branches: number;
  max_products: number;
  max_users: number;
  max_campaigns: number;
  is_active: boolean;
}

export interface AddonDTO {
  id: string;
  name: string;
  monthly_price: string;
  description: string;
  category: string;
  is_active: boolean;
}

export interface SubscriptionDTO {
  company_id: string;
  plan_id: string;
  billing_status: 'trial' | 'active' | 'past_due' | 'blocked' | 'cancelled';
  trial_ends_at: string | null;
  current_period_ends_at: string;
  blocked_reason: string | null;
}

export interface InvoiceDTO {
  id: string;
  company_id: string;
  amount: string;
  status: 'open' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  due_date: string;
  paid_at: string | null;
}

export interface MerchantCouponDTO {
  id: string;
  branch_id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_order: string;
  max_uses: number;
  current_uses: number;
  valid_until: string;
  is_active: boolean;
  rules: Record<string, unknown>;
}

export interface CampaignDTO {
  id: string;
  name: string;
  discount: string;
  status: 'active' | 'paused';
}

export interface ReviewDTO {
  id: string;
  target: string;
  author: string;
  rating: number;
  body: string;
}
