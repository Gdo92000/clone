import { pgEnum, pgTable, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { branches } from '../merchant/branches';

export const weekDay = pgEnum('week_day', [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

export const businessHours = pgTable('business_hours', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  weekday: weekDay('weekday').notNull(),
  is_closed: boolean('is_closed').default(false),
  is_24h: boolean('is_24h').default(false),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_business_hours_branch_weekday').on(table.branch_id, table.weekday),
]);
