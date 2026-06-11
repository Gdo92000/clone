import { pgEnum, pgTable, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { companies } from '../merchant/companies';
import { branches } from '../merchant/branches';

export const userRole = pgEnum('user_role', ['customer', 'merchant', 'courier', 'admin', 'superadmin']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: userRole('role').notNull().default('customer'),
  sub_role: text('sub_role'),
  password_hash: text('password_hash'),
  avatar_url: text('avatar_url'),
  is_active: boolean('is_active').default(true),
  company_id: text('company_id').references(() => companies.id),
  branch_id: text('branch_id').references(() => branches.id),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_users_company').on(table.company_id),
  index('idx_users_branch').on(table.branch_id),
]);
