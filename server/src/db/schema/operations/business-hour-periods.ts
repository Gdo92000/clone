import { pgTable, text, time, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { businessHours } from './business-hours';

export const businessHourPeriods = pgTable('business_hour_periods', {
  id: text('id').primaryKey(),
  business_hour_id: text('business_hour_id').references(() => businessHours.id, { onDelete: 'cascade' }).notNull(),
  open_time: time('open_time', { precision: 0 }).notNull(),
  close_time: time('close_time', { precision: 0 }).notNull(),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_bhp_business_hour').on(table.business_hour_id),
]);
