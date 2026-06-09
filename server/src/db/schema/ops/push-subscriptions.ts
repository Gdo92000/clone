import { pgTable, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from '../customer/users';

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  keys: jsonb('keys').notNull(),
  device_info: text('device_info'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_push_subscriptions_user').on(table.user_id),
  index('idx_push_subscriptions_endpoint').on(table.endpoint),
]);
