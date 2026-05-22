import { pgTable, numeric, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { planId } from './plans';
import type { AdditionalFee } from '../../jsonb-types';

export const commissionPlans = pgTable('commission_plans', {
  plan_id: planId('plan_id').primaryKey(),
  marketplace_fee: numeric('marketplace_fee', { precision: 5, scale: 2 }).notNull().default('12'),
  delivery_fee: numeric('delivery_fee', { precision: 5, scale: 2 }).notNull().default('8'),
  payment_fee: numeric('payment_fee', { precision: 5, scale: 2 }).notNull().default('3.5'),
  additional_fees: jsonb('additional_fees').$type<AdditionalFee[]>().default([]),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
