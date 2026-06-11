// Re-exportações diretas de cada submódulo — mantém compatibilidade com imports existentes
export * from './core';
export * from './customer';
export * from './merchant';
export * from './commerce';
export * from './saas';
export * from './ops';
export * from './operations';
export * from './indexes';

// Runtime imports — valores concretos para construir o objeto tables
import {
  users, addresses, orders as customerOrders, orderItems, reviews,
} from './customer';
import {
  categories, restaurants, menuItems, additives, coverageCities,
} from './core';
import {
  companies, branches, branchSettings, merchantOrders, merchantOrderItems, merchantMenuItems,
} from './merchant';
import {
  globalCoupons, merchantCoupons, campaigns,
  loyaltySettings, userLoyaltyPoints, loyaltyRewards,
} from './commerce';
import {
  plans, capabilities, subscriptions, invoices, addons, subscriptionAddons,
  commissionPlans, feature_flags,
} from './saas';
import {
  notifications, userNotifications, auditEvents,
  supportTickets, permissions,
  printerConfigs, printJobs, pushSubscriptions,
} from './ops';
import {
  idempotencyKeys, authSessions, passwordResets, auditLogs,
  businessHours, businessHourPeriods,
  holidayRules, holidayOverrides, specialDates,
} from './operations';

/**
 * Tables — tipo que reúne todas as tabelas drizzle.
 */
export interface Tables {
  users:              typeof users;
  addresses:          typeof addresses;
  orders:             typeof customerOrders;
  orderItems:         typeof orderItems;
  reviews:            typeof reviews;
  categories:         typeof categories;
  restaurants:        typeof restaurants;
  menuItems:          typeof menuItems;
  additives:          typeof additives;
  coverageCities:     typeof coverageCities;
  companies:          typeof companies;
  branches:           typeof branches;
  branchSettings:     typeof branchSettings;
  merchantOrders:     typeof merchantOrders;
  merchantOrderItems: typeof merchantOrderItems;
  merchantMenuItems:  typeof merchantMenuItems;
  globalCoupons:      typeof globalCoupons;
  merchantCoupons:    typeof merchantCoupons;
  campaigns:          typeof campaigns;
  loyaltySettings:    typeof loyaltySettings;
  userLoyaltyPoints:  typeof userLoyaltyPoints;
  loyaltyRewards:     typeof loyaltyRewards;
  plans:              typeof plans;
  capabilities:       typeof capabilities;
  subscriptions:      typeof subscriptions;
  invoices:           typeof invoices;
  addons:             typeof addons;
  subscriptionAddons: typeof subscriptionAddons;
  commissionPlans:    typeof commissionPlans;
  feature_flags:      typeof feature_flags;
  notifications:      typeof notifications;
  userNotifications:  typeof userNotifications;
  auditEvents:        typeof auditEvents;
  supportTickets:     typeof supportTickets;
  permissions:        typeof permissions;
  idempotencyKeys:    typeof idempotencyKeys;
  authSessions:       typeof authSessions;
  passwordResets:     typeof passwordResets;
  auditLogs:          typeof auditLogs;
  businessHours:      typeof businessHours;
  businessHourPeriods: typeof businessHourPeriods;
  holidayRules:       typeof holidayRules;
  holidayOverrides:   typeof holidayOverrides;
  specialDates:       typeof specialDates;
  printerConfigs:     typeof printerConfigs;
  printJobs:          typeof printJobs;
  pushSubscriptions:  typeof pushSubscriptions;
}

/** Objeto tables — reúne todas as tabelas num único objeto. */
export const tables: Tables = {
  users,
  addresses,
  orders: customerOrders,
  orderItems,
  reviews,
  categories,
  restaurants,
  menuItems,
  additives,
  coverageCities,
  companies,
  branches,
  branchSettings,
  merchantOrders,
  merchantOrderItems,
  merchantMenuItems,
  globalCoupons,
  merchantCoupons,
  campaigns,
  loyaltySettings,
  userLoyaltyPoints,
  loyaltyRewards,
  plans,
  capabilities,
  subscriptions,
  invoices,
  addons,
  subscriptionAddons,
  commissionPlans,
  feature_flags,
  notifications,
  userNotifications,
  auditEvents,
  supportTickets,
  permissions,
  idempotencyKeys,
  authSessions,
  passwordResets,
  auditLogs,
  businessHours,
  businessHourPeriods,
  holidayRules,
  holidayOverrides,
  specialDates,
  printerConfigs,
  printJobs,
  pushSubscriptions,
};
