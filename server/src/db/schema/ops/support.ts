import { pgEnum, pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from '../customer';

export const ticketStatus = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed']);

export const supportTickets = pgTable('support_tickets', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  status: ticketStatus('status').notNull().default('open'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_support_tickets_user').on(table.user_id),
  index('idx_support_tickets_status').on(table.status),
]);
