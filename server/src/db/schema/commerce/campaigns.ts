import { pgEnum, pgTable, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { branches } from '../merchant/branches';

export const campaignStatus = pgEnum('campaign_status', ['active', 'paused', 'finished']);

export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  discount_percentage: numeric('discount_percentage', { precision: 5, scale: 2 }),
  status: campaignStatus('status').notNull().default('active'),
  starts_at: timestamp('starts_at', { withTimezone: true }),
  ends_at: timestamp('ends_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
