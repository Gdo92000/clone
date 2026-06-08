import type { Review } from 'src/domain/entities/Review';

export const mockConsumerReviews: Review[] = [
  { id: 'review-1', userId: 'user-5', userName: 'Ana Cliente', restaurantId: 'rest-1', orderId: 'order-4', rating: 5, comment: 'Hamburguer excelente!', createdAt: new Date().toISOString() },
  { id: 'review-2', userId: 'user-5', userName: 'Ana Cliente', restaurantId: 'rest-2', orderId: 'order-2', rating: 4, comment: 'Bom, mas demorou um pouco.', createdAt: new Date(Date.now() - 86400000).toISOString() },
];
