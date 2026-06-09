import { relations } from 'drizzle-orm';
import { categories, restaurants, menuItems, additives } from './index';
import { branches } from '../merchant/branches';

export const categoriesRelations = relations(categories, ({ many }) => ({
  restaurants: many(restaurants),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  category: one(categories, {
    fields: [restaurants.category_id],
    references: [categories.id],
  }),
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurant_id],
    references: [restaurants.id],
  }),
  branch: one(branches, {
    fields: [menuItems.branch_id],
    references: [branches.id],
  }),
  additives: many(additives),
}));

export const additivesRelations = relations(additives, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [additives.menu_item_id],
    references: [menuItems.id],
  }),
}));
