import { pgEnum, pgTable, text, numeric, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { addresses } from './addresses';
import { restaurants } from '../core/restaurants';
import { menuItems } from '../core/menu-items';

export const orderStatus = pgEnum('order_status', ['confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled']);
export const deliveryType = pgEnum('delivery_type', ['delivery', 'pickup']);
export const paymentMethod = pgEnum('payment_method', ['credit', 'debit', 'pix', 'cash', 'meal_ticket']);

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id).notNull(),
  restaurant_id: text('restaurant_id').references(() => restaurants.id).notNull(),
  status: orderStatus('status').notNull().default('confirmed'),
  delivery_type: deliveryType('delivery_type').notNull().default('delivery'),
  payment_method: paymentMethod('payment_method').notNull(),
  address_id: text('address_id').references(() => addresses.id),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  delivery_fee: numeric('delivery_fee', { precision: 10, scale: 2 }).default('0'),
  discount: numeric('discount', { precision: 10, scale: 2 }).default('0'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  estimated_time: text('estimated_time'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_orders_user_created').on(table.user_id, table.created_at),
  index('idx_orders_restaurant').on(table.restaurant_id),
  index('idx_orders_status').on(table.status),
  index('idx_orders_address').on(table.address_id),
]);

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  order_id: text('order_id').references(() => orders.id).notNull(),
  menu_item_id: text('menu_item_id').references(() => menuItems.id).notNull(),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  additives: jsonb('additives'),
  notes: text('notes'),
}, (table) => [
  index('idx_order_items_order').on(table.order_id),
  index('idx_order_items_menu_item').on(table.menu_item_id),
]);
