import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, like, sql } from 'drizzle-orm';
import type { IRestaurantRepository, RestaurantFilter } from 'src/domain/repositories/IRestaurantRepository';
import type { MenuItem, Additive, Category, Restaurant } from 'src/domain/entities/Restaurant';
import { restaurants, menuItems, categories, additives } from 'server/src/db/schema/core';
import { fromDbRows, fromDbRow, toDbInput } from '../helpers';

export class PostgresRestaurantRepository implements IRestaurantRepository {
  constructor(private readonly _db: PostgresJsDatabase) {}

  async findMany(filter?: RestaurantFilter): Promise<Restaurant[]> {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filter?.cuisine) conditions.push(eq(restaurants.cuisine, filter.cuisine as 'pizza' | 'hamburger' | 'brazilian' | 'japanese' | 'mexican' | 'italian' | 'chinese' | 'healthy' | 'dessert' | 'cafe' | 'arabic' | 'seafood' | 'other'));
    if (filter?.city) conditions.push(eq(restaurants.city, filter.city));
    if (filter?.isFeatured !== undefined) conditions.push(eq(restaurants.is_featured, filter.isFeatured));
    if (filter?.minRating !== undefined) conditions.push(sql`${restaurants.rating} >= ${filter.minRating}`);
    if (filter?.where?.name) conditions.push(like(restaurants.name, `%${filter.where.name}%`));

    const rows = conditions.length > 0
      ? await this._db.select().from(restaurants).where(and(...conditions))
      : await this._db.select().from(restaurants);
    return fromDbRows<Restaurant>(rows);
  }

  async findById(id: string): Promise<Restaurant | null> {
    const rows = await this._db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as Restaurant;
  }

  async findByIds(ids: string[]): Promise<Restaurant[]> {
    if (ids.length === 0) return [];
    const rows = await this._db.select().from(restaurants);
    return fromDbRows<Restaurant>(rows.filter((r) => ids.includes(r.id)));
  }

  async create(data: Record<string, unknown>): Promise<Restaurant> {
    const rows = await this._db.insert(restaurants).values(        toDbInput(data) as typeof restaurants.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as Restaurant;
  }

  async update(id: string, data: Partial<Restaurant>): Promise<Restaurant | null> {
    const rows = await this._db.update(restaurants).set(        toDbInput(data) as Partial<typeof restaurants.$inferInsert>).where(eq(restaurants.id, id)).returning();
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as Restaurant;
  }

  async remove(id: string): Promise<boolean> {
    await this._db.delete(restaurants).where(eq(restaurants.id, id));
    return true;
  }

  async count(filter?: RestaurantFilter): Promise<number> {
    const rows = await this.findMany(filter);
    return rows.length;
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.findById(id);
    return row !== null;
  }

  async findMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const rows = await this._db.select().from(menuItems).where(eq(menuItems.restaurant_id, restaurantId));
    return fromDbRows<MenuItem>(rows);
  }

  async findCategories(): Promise<Category[]> {
    const rows = await this._db.select().from(categories);
    return fromDbRows<Category>(rows);
  }

  async findAdditives(menuItemId: string): Promise<Additive[]> {
    const rows = await this._db.select().from(additives).where(eq(additives.id, menuItemId));
    return fromDbRows<Additive>(rows);
  }

  async findByCuisine(cuisine: string): Promise<Restaurant[]> {
    const typedCuisine = cuisine as 'pizza' | 'hamburger' | 'brazilian' | 'japanese' | 'mexican' | 'italian' | 'chinese' | 'healthy' | 'dessert' | 'cafe' | 'arabic' | 'seafood' | 'other';
    const rows = await this._db.select().from(restaurants).where(eq(restaurants.cuisine, typedCuisine));
    return fromDbRows<Restaurant>(rows);
  }

  async findFeatured(): Promise<Restaurant[]> {
    const rows = await this._db.select().from(restaurants).where(eq(restaurants.is_featured, true));
    return fromDbRows<Restaurant>(rows);
  }
}
