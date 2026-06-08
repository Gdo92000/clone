export type MerchantOrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'dispatched'
  | 'delivered'
  | 'rejected';

export type OrderStatusType =
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'dispatched'
  | 'delivered';

export type DeliveryStatus =
  | 'available'
  | 'accepted'
  | 'picked_up'
  | 'in_route'
  | 'delivered';

export interface OrderStatusStep {
  status: string;
  label: string;
  time?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  additives?: string[];
  notes?: string;
}

export interface MerchantOrder {
  id: string;
  branchId: string;
  customerName: string;
  customerAddress: string;
  createdAt: string;
  status: MerchantOrderStatus;
  paymentMethod: string;
  deliveryType: 'delivery' | 'pickup';
  total: number;
  items: { name: string; quantity: number; price: number }[];
}

export interface ConsumerOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatusType;
  deliveryAddress: string;
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery?: string;
}
