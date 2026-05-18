import { relations } from 'drizzle-orm';
import { categories, restaurants, menuItems, additives } from './core';
import { users, addresses, orders, orderItems, reviews } from './customer';
import { companies, branches, merchantOrders, merchantOrderItems, merchantMenuItems } from './merchant';
import { globalCoupons, merchantCoupons, campaigns } from './commerce';
import { plans, capabilities, subscriptions, invoices, addons } from './saas';
import { supportTickets } from './ops';
import {
  businessHours, businessHourPeriods,
  holidayRules, holidayOverrides, holidayOverridePeriods,
  specialDates, specialDatePeriods,
} from './operations';

export const categoriesRelations = relations(categories, ({ many }) => ({
  restaurants: many(restaurants),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  category: one(categories, {
    fields: [restaurants.category_id],
    references: [categories.id],
  }),
  menuItems: many(menuItems),
  orders: many(orders),
  reviews: many(reviews),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurant_id],
    references: [restaurants.id],
  }),
  additives: many(additives),
  orderItems: many(orderItems),
}));

export const additivesRelations = relations(additives, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [additives.menu_item_id],
    references: [menuItems.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
  supportTickets: many(supportTickets),
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

export const companiesRelations = relations(companies, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [companies.id],
    references: [subscriptions.company_id],
  }),
  branches: many(branches),
  invoices: many(invoices),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  company: one(companies, {
    fields: [branches.company_id],
    references: [companies.id],
  }),
  merchantOrders: many(merchantOrders),
  merchantMenuItems: many(merchantMenuItems),
  merchantCoupons: many(merchantCoupons),
  campaigns: many(campaigns),
  businessHours: many(businessHours),
  holidayOverrides: many(holidayOverrides),
  specialDates: many(specialDates),
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

export const merchantMenuItemsRelations = relations(merchantMenuItems, ({ one }) => ({
  branch: one(branches, {
    fields: [merchantMenuItems.branch_id],
    references: [branches.id],
  }),
}));

export const globalCouponsRelations = relations(globalCoupons, ({}) => ({}));

export const merchantCouponsRelations = relations(merchantCoupons, ({ one }) => ({
  branch: one(branches, {
    fields: [merchantCoupons.branch_id],
    references: [branches.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  branch: one(branches, {
    fields: [campaigns.branch_id],
    references: [branches.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
  capabilities: many(capabilities),
}));

export const capabilitiesRelations = relations(capabilities, ({ one }) => ({
  requiredPlan: one(plans, {
    fields: [capabilities.required_plan],
    references: [plans.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  company: one(companies, {
    fields: [subscriptions.company_id],
    references: [companies.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  company: one(companies, {
    fields: [invoices.company_id],
    references: [companies.id],
  }),
}));

export const addonsRelations = relations(addons, ({}) => ({}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.user_id],
    references: [users.id],
  }),
}));

export const businessHoursRelations = relations(businessHours, ({ one, many }) => ({
  branch: one(branches, {
    fields: [businessHours.branch_id],
    references: [branches.id],
  }),
  periods: many(businessHourPeriods),
}));

export const businessHourPeriodsRelations = relations(businessHourPeriods, ({ one }) => ({
  businessHour: one(businessHours, {
    fields: [businessHourPeriods.business_hour_id],
    references: [businessHours.id],
  }),
}));

export const holidayRulesRelations = relations(holidayRules, ({ many }) => ({
  overrides: many(holidayOverrides),
}));

export const holidayOverridesRelations = relations(holidayOverrides, ({ one, many }) => ({
  branch: one(branches, {
    fields: [holidayOverrides.branch_id],
    references: [branches.id],
  }),
  holidayRule: one(holidayRules, {
    fields: [holidayOverrides.holiday_rule_id],
    references: [holidayRules.id],
  }),
  periods: many(holidayOverridePeriods),
}));

export const holidayOverridePeriodsRelations = relations(holidayOverridePeriods, ({ one }) => ({
  holidayOverride: one(holidayOverrides, {
    fields: [holidayOverridePeriods.holiday_override_id],
    references: [holidayOverrides.id],
  }),
}));

export const specialDatesRelations = relations(specialDates, ({ one, many }) => ({
  branch: one(branches, {
    fields: [specialDates.branch_id],
    references: [branches.id],
  }),
  periods: many(specialDatePeriods),
}));

export const specialDatePeriodsRelations = relations(specialDatePeriods, ({ one }) => ({
  specialDate: one(specialDates, {
    fields: [specialDatePeriods.special_date_id],
    references: [specialDates.id],
  }),
}));
