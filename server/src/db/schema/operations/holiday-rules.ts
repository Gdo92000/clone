import { pgEnum, pgTable, text, integer, date, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const holidayScope = pgEnum('holiday_scope', ['national', 'state', 'municipal']);
export const holidayOverrideType = pgEnum('holiday_override_type', ['closed', 'open_normal', 'custom_hours']);

export const holidayRules = pgTable('holiday_rules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  date: date('date').notNull(),
  scope: holidayScope('scope').notNull(),
  state_code: text('state_code'),
  city_code: text('city_code'),
  is_recurring: boolean('is_recurring').default(true),
  year: integer('year'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_holiday_rules_date').on(table.date),
  index('idx_holiday_rules_scope').on(table.scope),
  index('idx_holiday_rules_year').on(table.year),
]);
