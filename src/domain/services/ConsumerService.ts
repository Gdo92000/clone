import type { IConsumerRepository } from 'src/domain/repositories/IConsumerRepository';
import type { ConsumerOrder } from 'src/domain/entities/Order';
import type { Review } from 'src/domain/entities/Review';

export class ConsumerService {
  constructor(private readonly consumerRepo: IConsumerRepository) {}

  async listOrders(userId: string): Promise<ConsumerOrder[]> {
    return this.consumerRepo.findOrdersByUser(userId);
  }

  async createOrder(order: ConsumerOrder): Promise<ConsumerOrder> {
    return this.consumerRepo.createOrder(order);
  }

  async listReviews(restaurantId: string): Promise<Review[]> {
    return this.consumerRepo.findReviewsByRestaurant(restaurantId);
  }

  async createReview(review: Review): Promise<Review> {
    return this.consumerRepo.createReview(review);
  }
}
