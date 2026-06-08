import { pgTable, text, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const idempotencyKeys = pgTable('idempotency_keys', {
  idempotency_key: text('idempotency_key').primaryKey(),
  endpoint: text('endpoint').notNull(),
  user_id: text('user_id').notNull(),
  status: text('status').notNull().default('processing'),
  response_status: integer('response_status'),
  response_body: jsonb('response_body'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [
  index('idx_idempotency_keys_expires').on(table.expires_at),
]);
