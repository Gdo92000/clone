import { pgTable, text, time, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { branches } from '../merchant';

export const specialDates = pgTable('special_dates', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  date: text('date').notNull(),
  label: text('label'),
  is_closed: boolean('is_closed').default(false),
  is_24h: boolean('is_24h').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_special_dates_branch').on(table.branch_id),
  index('idx_special_dates_date').on(table.date),
]);

export const specialDatePeriods = pgTable('special_date_periods', {
  id: text('id').primaryKey(),
  special_date_id: text('special_date_id').references(() => specialDates.id, { onDelete: 'cascade' }).notNull(),
  open_time: time('open_time', { precision: 0 }).notNull(),
  close_time: time('close_time', { precision: 0 }).notNull(),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_sdp_special_date').on(table.special_date_id),
]);
