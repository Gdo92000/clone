import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from '../customer/users';

export const authSessions = pgTable('auth_sessions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refresh_token_hash: text('refresh_token_hash').notNull(),
  token_lookup: text('token_lookup'),
  device_info: text('device_info'),
  ip_address: text('ip_address'),
  last_used_at: timestamp('last_used_at', { withTimezone: true }).defaultNow(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  revoked_at: timestamp('revoked_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx: index('idx_auth_sessions_user').on(table.user_id),
  tokenLookupIdx: index('idx_auth_sessions_token_lookup').on(table.token_lookup),
  expiresIdx: index('idx_auth_sessions_expires').on(table.expires_at),
}));
