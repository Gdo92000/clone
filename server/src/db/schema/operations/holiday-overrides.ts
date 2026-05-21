import { pgTable, text, time, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { branches } from '../merchant';
import { holidayRules , holidayOverrideType } from './holiday-rules';

export const holidayOverrides = pgTable('holiday_overrides', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  holiday_rule_id: text('holiday_rule_id').references(() => holidayRules.id),
  override_type: holidayOverrideType('override_type').notNull(),
  custom_date: text('custom_date').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_holiday_overrides_branch').on(table.branch_id),
  index('idx_holiday_overrides_date').on(table.custom_date),
  index('idx_holiday_overrides_holiday').on(table.holiday_rule_id),
]);

export const holidayOverridePeriods = pgTable('holiday_override_periods', {
  id: text('id').primaryKey(),
  holiday_override_id: text('holiday_override_id').references(() => holidayOverrides.id, { onDelete: 'cascade' }).notNull(),
  open_time: time('open_time', { precision: 0 }).notNull(),
  close_time: time('close_time', { precision: 0 }).notNull(),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_hop_override').on(table.holiday_override_id),
]);
