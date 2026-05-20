import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { subscriptions } from './subscriptions';
import { addons } from './addons';
 
export const subscriptionAddons = pgTable('subscription_addons', {
  subscription_id: text('subscription_id').references(() => subscriptions.id).notNull(),
  addon_id: text('addon_id').references(() => addons.id).notNull(),
  activated_at: timestamp('activated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.subscription_id, table.addon_id] }),
]);
