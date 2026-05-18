import { pgTable, text, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';

export const addons = pgTable('addons', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  monthly_price: numeric('monthly_price', { precision: 10, scale: 2 }).notNull(),
  feature_key: text('feature_key').notNull().unique(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
