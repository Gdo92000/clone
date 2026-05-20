import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
 
export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
 
export const rolePermissions = pgTable('role_permissions', {
  role: text('role').notNull(),
  permission_id: text('permission_id').references(() => permissions.id).notNull(),
}, (table) => [
  index('idx_role_perm').on(table.role, table.permission_id),
]);
