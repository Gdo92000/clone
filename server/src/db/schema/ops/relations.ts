import { relations } from 'drizzle-orm';
import { supportTickets } from './index';
import { users } from '../customer';

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.user_id],
    references: [users.id],
  }),
}));
