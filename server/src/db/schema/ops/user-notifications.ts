import { pgTable, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from '../customer';
import { notifications } from './notifications';

export const userNotifications = pgTable('user_notifications', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  broadcast_id: text('broadcast_id').references(() => notifications.id),
  title: text('title').notNull(),
  body: text('body').notNull(),
  read: boolean('read').notNull().default(false),
  read_at: timestamp('read_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_user_notifications_user').on(table.user_id, table.created_at),
  index('idx_user_notifications_read').on(table.user_id, table.read),
]);
