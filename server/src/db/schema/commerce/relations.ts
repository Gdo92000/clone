import { relations } from 'drizzle-orm';
import { globalCoupons, merchantCoupons, campaigns } from './index';
import { branches } from '../merchant';

export const globalCouponsRelations = relations(globalCoupons, () => ({}));

export const merchantCouponsRelations = relations(merchantCoupons, ({ one }) => ({
  branch: one(branches, {
    fields: [merchantCoupons.branch_id],
    references: [branches.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  branch: one(branches, {
    fields: [campaigns.branch_id],
    references: [branches.id],
  }),
}));
