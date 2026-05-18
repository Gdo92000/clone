import { pgTable, text, numeric, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { companies } from './companies';

export const branches = pgTable('branches', {
  id: text('id').primaryKey(),
  company_id: text('company_id').references(() => companies.id).notNull(),
  name: text('name').notNull(),
  cep: text('cep'),
  address: text('address').notNull(),
  number: text('number'),
  neighborhood: text('neighborhood').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  delivery_radius_km: integer('delivery_radius_km').default(8),
  phone: text('phone'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_branches_company').on(table.company_id),
]);
