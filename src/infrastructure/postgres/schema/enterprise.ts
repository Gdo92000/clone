import { pgTable, text, numeric, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const demoCategories = pgTable('demo_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  cuisine: text('cuisine').notNull(),
  image_url: text('image_url'),
  tags: jsonb('tags').default([]),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const demoProducts = pgTable('demo_products', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id').notNull(),
  category_id: text('category_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  image_url: text('image_url'),
  base_price: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
  available: boolean('available').default(true),
  tags: jsonb('tags').default([]),
  options: jsonb('options').default([]),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const demoCompanyProfiles = pgTable('demo_company_profiles', {
  company_id: text('company_id').primaryKey(),
  logo_url: text('logo_url'),
  banner_url: text('banner_url'),
  commercial_status: text('commercial_status').default('active'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const demoCustomers = pgTable('demo_customers', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  name: text('name').notNull(),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const planLimits = pgTable('plan_limits', {
  company_id: text('company_id').primaryKey(),
  max_branches: numeric('max_branches', { precision: 5, scale: 0 }).default('0'),
  max_products: numeric('max_products', { precision: 5, scale: 0 }).default('0'),
  max_users: numeric('max_users', { precision: 5, scale: 0 }).default('0'),
  max_campaigns: numeric('max_campaigns', { precision: 5, scale: 0 }).default('0'),
  usage_branches: numeric('usage_branches', { precision: 5, scale: 0 }).default('0'),
  usage_products: numeric('usage_products', { precision: 5, scale: 0 }).default('0'),
  usage_users: numeric('usage_users', { precision: 5, scale: 0 }).default('0'),
  usage_campaigns: numeric('usage_campaigns', { precision: 5, scale: 0 }).default('0'),
  usage_coupons: numeric('usage_coupons', { precision: 5, scale: 0 }).default('0'),
  usage_reports: numeric('usage_reports', { precision: 5, scale: 0 }).default('0'),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const enterpriseSchema = {
  demoCategories,
  demoProducts,
  demoCompanyProfiles,
  demoCustomers,
  planLimits,
};

export type EnterpriseTables = typeof enterpriseSchema;
