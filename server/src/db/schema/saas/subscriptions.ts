import { pgEnum, pgTable, text, numeric, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { planId } from './plans';
import { companies } from '../merchant';

export const billingStatus = pgEnum('billing_status', ['trial', 'active', 'past_due', 'blocked', 'cancelled']);
export const invoiceStatus = pgEnum('invoice_status', ['open', 'paid', 'overdue', 'cancelled', 'refunded']);

export const subscriptions = pgTable('subscriptions', {
  company_id: text('company_id').primaryKey().references(() => companies.id),
  plan_id: planId('plan_id').notNull(),
  addon_ids: jsonb('addon_ids'),
  billing_status: billingStatus('billing_status').notNull().default('trial'),
  trial_ends_at: timestamp('trial_ends_at', { withTimezone: true }),
  current_period_ends_at: timestamp('current_period_ends_at', { withTimezone: true }).notNull(),
  blocked_reason: text('blocked_reason'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_subscriptions_status').on(table.billing_status),
]);

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  company_id: text('company_id').references(() => companies.id).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: invoiceStatus('status').notNull().default('open'),
  due_date: timestamp('due_date', { withTimezone: true }).notNull(),
  paid_at: timestamp('paid_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_invoices_company').on(table.company_id),
  index('idx_invoices_status').on(table.status),
  index('idx_invoices_due_date').on(table.due_date),
]);
