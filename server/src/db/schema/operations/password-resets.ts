import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from '../customer/users';

export const passwordResets = pgTable('password_resets', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token_hash: text('token_hash').notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  used_at: timestamp('used_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_password_resets_token').on(table.token_hash),
  index('idx_password_resets_user').on(table.user_id),
]);
