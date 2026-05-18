import { pgEnum, pgTable, text, numeric, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { categories } from './categories';

export const cuisineType = pgEnum('cuisine_type', [
  'pizza',
  'hamburger',
  'brazilian',
  'japanese',
  'mexican',
  'italian',
  'chinese',
  'healthy',
  'dessert',
  'cafe',
  'arabic',
  'seafood',
  'other',
]);

export const restaurants = pgTable('restaurants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  cuisine: cuisineType('cuisine').notNull(),
  category_id: text('category_id').references(() => categories.id),
  address: text('address').notNull(),
  number: text('number'),
  neighborhood: text('neighborhood'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zip_code: text('zip_code'),
  phone: text('phone'),
  image_url: text('image_url'),
  banner_url: text('banner_url'),
  delivery_fee: numeric('delivery_fee', { precision: 10, scale: 2 }).default('0'),
  delivery_time: text('delivery_time'),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0'),
  review_count: integer('review_count').default(0),
  is_featured: boolean('is_featured').default(false),
  promotional_offer: text('promotional_offer'),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  payment_methods: text('payment_methods'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_restaurants_category').on(table.category_id),
]);
