import { pgTable, text, numeric, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const addresses = pgTable('addresses', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id).notNull(),
  label: text('label').notNull().default('Casa'),
  street: text('street').notNull(),
  number: text('number').notNull(),
  complement: text('complement'),
  neighborhood: text('neighborhood'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zip_code: text('zip_code'),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  is_default: boolean('is_default').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_addresses_user').on(table.user_id),
]);
