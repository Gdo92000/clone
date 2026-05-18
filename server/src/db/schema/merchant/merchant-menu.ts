import { pgTable, text, numeric, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { branches } from './branches';

export const merchantMenuItems = pgTable('merchant_menu_items', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  is_available: boolean('is_available').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_merchant_menu_items_branch').on(table.branch_id),
]);
