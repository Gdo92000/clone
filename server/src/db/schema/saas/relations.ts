import { relations } from 'drizzle-orm';
import { plans, capabilities, subscriptions, invoices, addons } from './index';
import { companies } from '../merchant';

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
  capabilities: many(capabilities),
}));

export const capabilitiesRelations = relations(capabilities, ({ one }) => ({
  requiredPlan: one(plans, {
    fields: [capabilities.required_plan],
    references: [plans.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  company: one(companies, {
    fields: [subscriptions.company_id],
    references: [companies.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  company: one(companies, {
    fields: [invoices.company_id],
    references: [companies.id],
  }),
}));

export const addonsRelations = relations(addons, () => ({}));
