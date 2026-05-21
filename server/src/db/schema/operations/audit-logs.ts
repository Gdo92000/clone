import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from '../customer/users';

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entity_type: text('entity_type'),
  entity_id: text('entity_id'),
  metadata: text('metadata'),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_audit_logs_user').on(table.user_id),
  index('idx_audit_logs_action').on(table.action),
  index('idx_audit_logs_created').on(table.created_at),
]);
