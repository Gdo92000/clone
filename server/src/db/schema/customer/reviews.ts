import { pgTable, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { restaurants } from '../core';
import { orders } from './orders';

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id).notNull(),
  restaurant_id: text('restaurant_id').references(() => restaurants.id).notNull(),
  order_id: text('order_id').references(() => orders.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_reviews_restaurant').on(table.restaurant_id),
  index('idx_reviews_user').on(table.user_id),
]);
