import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import type { IConsumerRepository, ConsumerOrderFilter } from 'src/domain/repositories/IConsumerRepository';
import type { ConsumerOrder, OrderItem } from 'src/domain/entities/Order';
import type { Review } from 'src/domain/entities/Review';
import { orders as customerOrders, orderItems, reviews } from 'server/src/db/schema/customer';
import { fromDbRows, fromDbRow, toDbInput } from '../helpers';

export class PostgresConsumerRepository implements IConsumerRepository {
  constructor(private readonly _db: PostgresJsDatabase) {}

  async findMany(filter?: ConsumerOrderFilter): Promise<ConsumerOrder[]> {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filter?.restaurantId) conditions.push(eq(customerOrders.restaurant_id, filter.restaurantId));
    if (filter?.status) conditions.push(eq(customerOrders.status, filter.status as 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled'));
    const rows = conditions.length > 0
      ? await this._db.select().from(customerOrders).where(and(...conditions))
      : await this._db.select().from(customerOrders);
    return fromDbRows<ConsumerOrder>(rows);
  }

  async findById(id: string): Promise<ConsumerOrder | null> {
    const rows = await this._db.select().from(customerOrders).where(eq(customerOrders.id, id)).limit(1);
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as ConsumerOrder;
  }

  async findByIds(ids: string[]): Promise<ConsumerOrder[]> {
    const rows = await this._db.select().from(customerOrders);
    return fromDbRows<ConsumerOrder>(rows.filter((r) => ids.includes(r.id)));
  }

  async create(data: Record<string, unknown>): Promise<ConsumerOrder> {
    const rows = await this._db.insert(customerOrders).values(        toDbInput(data) as typeof customerOrders.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as ConsumerOrder;
  }

  async update(id: string, data: Partial<ConsumerOrder>): Promise<ConsumerOrder | null> {
    const rows = await this._db.update(customerOrders).set(        toDbInput(data) as Partial<typeof customerOrders.$inferInsert>).where(eq(customerOrders.id, id)).returning();
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as ConsumerOrder;
  }

  async remove(id: string): Promise<boolean> {
    await this._db.delete(customerOrders).where(eq(customerOrders.id, id));
    return true;
  }

  async count(filter?: ConsumerOrderFilter): Promise<number> {
    const rows = await this.findMany(filter);
    return rows.length;
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.findById(id);
    return row !== null;
  }

  async findOrdersByUser(userId: string): Promise<ConsumerOrder[]> {
    const rows = await this._db.select().from(customerOrders).where(eq(customerOrders.user_id, userId));
    return fromDbRows<ConsumerOrder>(rows);
  }

  async findOrderItems(orderId: string): Promise<OrderItem[]> {
    const rows = await this._db.select().from(orderItems).where(eq(orderItems.order_id, orderId));
    return fromDbRows<OrderItem>(rows);
  }

  async createOrder(data: ConsumerOrder): Promise<ConsumerOrder> {
    const rows = await this._db.insert(customerOrders).values(        toDbInput(data) as typeof customerOrders.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as ConsumerOrder;
  }

  async findReviewsByUser(userId: string): Promise<Review[]> {
    const rows = await this._db.select().from(reviews).where(eq(reviews.user_id, userId));
    return fromDbRows<Review>(rows);
  }

  async findReviewsByRestaurant(restaurantId: string): Promise<Review[]> {
    const rows = await this._db.select().from(reviews).where(eq(reviews.restaurant_id, restaurantId));
    return fromDbRows<Review>(rows);
  }

  async createReview(data: Review): Promise<Review> {
    const rows = await this._db.insert(reviews).values(        toDbInput(data) as typeof reviews.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as Review;
  }
}
