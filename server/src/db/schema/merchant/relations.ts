import { relations } from 'drizzle-orm';
import { companies, branches, merchantOrders, merchantOrderItems } from './index';
import { menuItems } from '../core/menu-items';

export const companiesRelations = relations(companies, ({ many }) => ({
  branches: many(branches),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  company: one(companies, {
    fields: [branches.company_id],
    references: [companies.id],
  }),
  merchantOrders: many(merchantOrders),
  menuItems: many(menuItems),
}));

export const merchantOrdersRelations = relations(merchantOrders, ({ one, many }) => ({
  branch: one(branches, {
    fields: [merchantOrders.branch_id],
    references: [branches.id],
  }),
  items: many(merchantOrderItems),
}));

export const merchantOrderItemsRelations = relations(merchantOrderItems, ({ one }) => ({
  merchantOrder: one(merchantOrders, {
    fields: [merchantOrderItems.merchant_order_id],
    references: [merchantOrders.id],
  }),
}));
