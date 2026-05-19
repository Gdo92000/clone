import { pgTable, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { branches } from './branches';

export const branchSettings = pgTable('branch_settings', {
  branch_id: text('branch_id').references(() => branches.id).notNull().primaryKey(),
  opening_time: text('opening_time').notNull().default('18:00'),
  closing_time: text('closing_time').notNull().default('23:30'),
  preparation_time: text('preparation_time').notNull().default('35'),
  minimum_order: text('minimum_order').notNull().default('25'),
  accepts_delivery: boolean('accepts_delivery').notNull().default(true),
  accepts_pickup: boolean('accepts_pickup').notNull().default(true),
  pix_key: text('pix_key').default(''),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_branch_settings_branch').on(table.branch_id),
]);
