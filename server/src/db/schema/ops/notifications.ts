import { pgEnum, pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { planId, plans } from '../saas/plans';

export const notificationTarget = pgEnum('notification_target', ['all', 'active', 'inactive', 'plan']);

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  target: notificationTarget('target').notNull(),
  plan_id: planId('plan_id').references(() => plans.id),
  sent_by: text('sent_by').notNull(),
  delivered_count: integer('delivered_count').default(0),
  read_count: integer('read_count').default(0),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
