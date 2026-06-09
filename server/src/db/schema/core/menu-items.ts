import { pgTable, text, numeric, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { restaurants } from './restaurants';
import { branches } from '../merchant/branches';

export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').references(() => restaurants.id).notNull(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  original_price: numeric('original_price', { precision: 10, scale: 2 }),
  image_url: text('image_url'),
  category: text('category').notNull(),
  is_available: boolean('is_available').default(true),
  is_visible_to_consumer: boolean('is_visible_to_consumer').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_menu_items_restaurant').on(table.restaurant_id),
  index('idx_menu_items_branch').on(table.branch_id),
  index('idx_menu_items_category').on(table.category),
  index('idx_menu_items_visible').on(table.is_visible_to_consumer),
]);
