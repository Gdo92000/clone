import { pgEnum, pgTable, text, numeric, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const planId = pgEnum('plan_id', ['basic', 'pro', 'premium']);
export const capabilityCategory = pgEnum('capability_category', ['core', 'premium', 'addon', 'enterprise', 'financial', 'automation', 'analytics', 'integration', 'operations']);
export const billingChargeType = pgEnum('billing_charge_type', ['included', 'monthly_addon', 'usage_based', 'enterprise_contract']);

export const plans = pgTable('plans', {
id: planId('id').primaryKey(),
name: text('name').notNull(),
monthly_price: numeric('monthly_price', { precision: 10, scale: 2 }).notNull(),
description: text('description'),
max_branches: integer('max_branches').default(1),
max_products: integer('max_products').default(50),
max_users: integer('max_users').default(3),
max_campaigns: integer('max_campaigns').default(0),
platform_fee_rate: numeric('platform_fee_rate', { precision: 5, scale: 4 }).default('0.12'),
delivery_fee_per_order: numeric('delivery_fee_per_order', { precision: 10, scale: 2 }).default('5.00'),
is_active: boolean('is_active').default(true),
created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const capabilities = pgTable('capabilities', {
  id: text('id').primaryKey(),
  feature_key: text('feature_key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  monthly_price: numeric('monthly_price', { precision: 10, scale: 2 }).default('0'),
  category: capabilityCategory('category').notNull(),
  charge_type: billingChargeType('charge_type').notNull().default('included'),
  required_plan: planId('required_plan'),
  dependencies: jsonb('dependencies').$type<string[]>(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
