import { pgTable, text, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { branches } from '../merchant/branches';
 
export const printerConfigs = pgTable('printer_configs', {
  branch_id: text('branch_id').primaryKey().references(() => branches.id),
  printer_type: text('printer_type', { enum: ['network', 'usb', 'bluetooth'] }).notNull().default('network'),
  ip_address: text('ip_address'),
  port: integer('port').default(9100),
  model: text('model').default('ESC/POS'),
  enabled: boolean('enabled').default(true),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
 
export const printJobs = pgTable('print_jobs', {
  id: text('id').primaryKey(),
  order_id: text('order_id').notNull(),
  branch_id: text('branch_id').references(() => branches.id).notNull(),
  status: text('status', { enum: ['pending', 'sent', 'completed', 'failed', 'retrying'] }).notNull().default('pending'),
  retry_count: integer('retry_count').notNull().default(0),
  error_message: text('error_message'),
  payload: text('payload').notNull(), // The actual ESC/POS bytes or structured data
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_print_jobs_order').on(table.order_id),
  index('idx_print_jobs_status').on(table.status),
  index('idx_print_jobs_branch').on(table.branch_id),
]);
