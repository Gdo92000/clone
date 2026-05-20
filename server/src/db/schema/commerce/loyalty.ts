import { pgTable, text, numeric, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from '../customer/users';
import { branches } from '../merchant/branches';

export const loyaltySettings = pgTable('loyalty_settings', {
  branch_id: text('branch_id').primaryKey().references(() => branches.id),
  points_per_real: numeric('points_per_real', { precision: 5, scale: 2 }).notNull().default('1.00'),
  enabled: boolean('enabled').default(false),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const userLoyaltyPoints = pgTable('user_loyalty_points', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id).notNull(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  points_balance: integer('points_balance').notNull().default(0),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_loyalty_user_branch').on(table.user_id, table.branch_id),
]);

export const loyaltyRewards = pgTable('loyalty_rewards', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  name: text('name').notNull(),
  points_required: integer('points_required').notNull(),
  discount_value: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  discount_type: text('discount_type', { enum: ['percentage', 'fixed'] }).notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
