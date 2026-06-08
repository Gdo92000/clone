import { pgTable, text, numeric, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const coverageCities = pgTable(
  'coverage_cities',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    state: text('state').notNull(),
    latitude: numeric('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: numeric('longitude', { precision: 10, scale: 7 }).notNull(),
    radius_km: integer('radius_km').notNull().default(18),
    restaurant_count: integer('restaurant_count').default(0),
    is_active: boolean('is_active').default(true),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_coverage_cities_name_state').on(table.name, table.state),
    index('idx_coverage_cities_active').on(table.is_active),
  ],
);
