import type { ConsumerOrder } from 'src/domain/entities/Order';

export const mockConsumerOrders: ConsumerOrder[] = [
  { id: 'order-1', restaurantId: 'rest-1', restaurantName: 'Burger House', items: [], total: 28.90, status: 'confirmed', deliveryAddress: 'Rua Fernandes, 123', paymentMethod: 'credit_card', createdAt: new Date().toISOString() },
  { id: 'order-4', restaurantId: 'rest-1', restaurantName: 'Burger House', items: [], total: 71.80, status: 'delivered', deliveryAddress: 'Rua Haddock Lobo, 800', paymentMethod: 'credit_card', createdAt: new Date(Date.now() - 86400000).toISOString() },
];
