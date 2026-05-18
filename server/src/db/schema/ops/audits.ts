import { pgTable, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const auditEvents = pgTable('audit_events', {
  id: text('id').primaryKey(),
  actor_id: text('actor_id').notNull(),
  action: text('action').notNull(),
  target: text('target').notNull(),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_audit_events_created').on(table.created_at),
  index('idx_audit_events_actor').on(table.actor_id),
]);
