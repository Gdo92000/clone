import type { ConsumerOrder, OrderItem } from 'src/domain/entities/Order';
import type { Review } from 'src/domain/entities/Review';
import type { RepositoryPort, RepositoryFilter } from './RepositoryPort';

export type ConsumerOrderFilter = RepositoryFilter<ConsumerOrder> & {
  restaurantId?: string;
  status?: string;
};

export interface IConsumerRepository extends RepositoryPort<ConsumerOrder, ConsumerOrderFilter> {
  findOrdersByUser(userId: string): Promise<ConsumerOrder[]>;
  findOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrder(data: ConsumerOrder): Promise<ConsumerOrder>;

  // Reviews
  findReviewsByUser(userId: string): Promise<Review[]>;
  findReviewsByRestaurant(restaurantId: string): Promise<Review[]>;
  createReview(data: Review): Promise<Review>;
}
