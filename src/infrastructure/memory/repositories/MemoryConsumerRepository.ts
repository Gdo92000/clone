/* eslint-disable @typescript-eslint/require-await */
import type { IConsumerRepository, ConsumerOrderFilter } from 'src/domain/repositories/IConsumerRepository';
import type { ConsumerOrder, OrderItem } from 'src/domain/entities/Order';
import type { Review } from 'src/domain/entities/Review';
import { mockConsumerOrders } from '../data/consumer-orders';
import { mockConsumerReviews } from '../data/consumer-reviews';

export class MemoryConsumerRepository implements IConsumerRepository {
  private orders = [...mockConsumerOrders];
  private reviews = [...mockConsumerReviews];

  async findMany(filter?: ConsumerOrderFilter): Promise<ConsumerOrder[]> {
    let result = this.orders;
    if (filter?.restaurantId) result = result.filter(o => o.restaurantId === filter.restaurantId);
    if (filter?.status) result = result.filter(o => o.status === filter.status);
    return result;
  }

  async findById(id: string): Promise<ConsumerOrder | null> {
    const found = this.orders.find(o => o.id === id);
    return found ?? null;
  }

  async findByIds(ids: string[]): Promise<ConsumerOrder[]> {
    return this.orders.filter(o => ids.includes(o.id));
  }

  async create(data: Record<string, unknown>): Promise<ConsumerOrder> {
    const item = { id: crypto.randomUUID(), ...data } as unknown as ConsumerOrder;
    this.orders.push(item);
    return item;
  }

  async update(id: string, data: Partial<ConsumerOrder>): Promise<ConsumerOrder | null> {
    const found = this.orders.find(o => o.id === id);
    if (!found) return null;
    Object.assign(found, data);
    return found;
  }

  async remove(id: string): Promise<boolean> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) return false;
    this.orders.splice(index, 1);
    return true;
  }

  async count(): Promise<number> {
    return this.orders.length;
  }

  async exists(id: string): Promise<boolean> {
    return this.orders.some(o => o.id === id);
  }

  async findOrdersByUser(_userId: string): Promise<ConsumerOrder[]> {
    return this.orders;
  }

  async findOrderItems(_orderId: string): Promise<OrderItem[]> {
    return [];
  }

  async createOrder(data: ConsumerOrder): Promise<ConsumerOrder> {
    return this.create(data as unknown as Record<string, unknown>);
  }

  async findReviewsByUser(_userId: string): Promise<Review[]> {
    return this.reviews;
  }

  async findReviewsByRestaurant(restaurantId: string): Promise<Review[]> {
    return this.reviews.filter(r => r.restaurantId === restaurantId);
  }

  async createReview(data: Review): Promise<Review> {
    this.reviews.push(data);
    return data;
  }
}
