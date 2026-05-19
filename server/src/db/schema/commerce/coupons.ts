import { pgEnum, pgTable, text, numeric, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { branches } from '../merchant';

export const discountType = pgEnum('discount_type', ['percentage', 'fixed']);

export const globalCoupons = pgTable('global_coupons', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description'),
  discount_type: discountType('discount_type').notNull(),
  discount_value: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  min_order: numeric('min_order', { precision: 10, scale: 2 }).default('0'),
  max_uses: integer('max_uses').default(0),
  current_uses: integer('current_uses').default(0),
  valid_from: timestamp('valid_from', { withTimezone: true }).notNull(),
  valid_until: timestamp('valid_until', { withTimezone: true }).notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const merchantCoupons = pgTable('merchant_coupons', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  code: text('code').notNull(),
  description: text('description'),
  discount_type: discountType('discount_type').notNull(),
  discount_value: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  min_order: numeric('min_order', { precision: 10, scale: 2 }).default('0'),
  max_uses: integer('max_uses').default(0),
  current_uses: integer('current_uses').default(0),
  valid_until: timestamp('valid_until', { withTimezone: true }).notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
