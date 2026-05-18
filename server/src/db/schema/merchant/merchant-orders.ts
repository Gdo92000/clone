import { pgEnum, pgTable, text, numeric, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { branches } from './branches';

export const merchantOrderStatus = pgEnum('merchant_order_status', [
  'new',
  'accepted',
  'preparing',
  'ready',
  'dispatched',
  'delivered',
  'rejected',
]);

export const merchantOrders = pgTable('merchant_orders', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  customer_name: text('customer_name').notNull(),
  customer_address: text('customer_address').notNull(),
  customer_phone: text('customer_phone'),
  status: merchantOrderStatus('status').notNull().default('new'),
  payment_method: text('payment_method').notNull(),
  delivery_type: text('delivery_type').notNull().default('delivery'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_merchant_orders_branch_status').on(table.branch_id, table.status),
  index('idx_merchant_orders_created').on(table.created_at),
]);

export const merchantOrderItems = pgTable('merchant_order_items', {
  id: text('id').primaryKey(),
  merchant_order_id: text('merchant_order_id').references(() => merchantOrders.id).notNull(),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  index('idx_merchant_order_items_order').on(table.merchant_order_id),
]);
