import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { planId, plans } from '../saas/plans';

export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  document: text('document'),
  plan_id: planId('plan_id').references(() => plans.id),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
