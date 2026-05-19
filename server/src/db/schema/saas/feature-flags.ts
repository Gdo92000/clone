import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { companies, branches } from '../merchant';
import { users } from '../customer';

export const feature_flags = pgTable('feature_flags', {
  id: text('id').primaryKey(),
  company_id: text('company_id').references(() => companies.id),
  branch_id: text('branch_id').references(() => branches.id),
  user_id: text('user_id').references(() => users.id),
  feature_key: text('feature_key').notNull(),
  enabled: boolean('enabled').notNull(),
  reason: text('reason'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
