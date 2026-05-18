import { relations } from 'drizzle-orm';
import { users, addresses, orders, orderItems, reviews } from './index';
import { restaurants, menuItems } from '../core';

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.user_id],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurant_id],
    references: [restaurants.id],
  }),
  address: one(addresses, {
    fields: [orders.address_id],
    references: [addresses.id],
  }),
  items: many(orderItems),
  reviews: many(reviews),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menu_item_id],
    references: [menuItems.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.user_id],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [reviews.restaurant_id],
    references: [restaurants.id],
  }),
  order: one(orders, {
    fields: [reviews.order_id],
    references: [orders.id],
  }),
}));
