import { pgEnum, pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['customer', 'merchant', 'courier', 'admin', 'superadmin']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: userRole('role').notNull().default('customer'),
  password_hash: text('password_hash'),
  avatar_url: text('avatar_url'),
  is_active: boolean('is_active').default(true),
  company_id: text('company_id'),
  branch_id: text('branch_id'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
