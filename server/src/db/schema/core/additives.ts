import { pgTable, text, numeric, index } from 'drizzle-orm/pg-core';
import { menuItems } from './menu-items';

export const additives = pgTable('additives', {
  id: text('id').primaryKey(),
  menu_item_id: text('menu_item_id').references(() => menuItems.id).notNull(),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  index('idx_additives_menu_item').on(table.menu_item_id),
]);
