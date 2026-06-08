export type CourierStatus = 'available' | 'busy' | 'offline';

export type DeliveryStatus =
  | 'available'
  | 'accepted'
  | 'picked_up'
  | 'in_route'
  | 'delivered';

export interface Courier {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  status: CourierStatus;
  currentOrderId?: string;
  coordinates?: { latitude: number; longitude: number };
}

export interface Delivery {
  id: string;
  orderId: string;
  courierId?: string;
  status: DeliveryStatus;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedTime: number;
  startedAt?: string;
  completedAt?: string;
}

export interface DeliveryRoute {
  id: string;
  courierId: string;
  stops: DeliveryStop[];
  startedAt?: string;
  completedAt?: string;
}

export interface DeliveryStop {
  orderId: string;
  address: string;
  sequence: number;
  status: 'pending' | 'arrived' | 'completed' | 'skipped';
  estimatedArrival?: string;
}
