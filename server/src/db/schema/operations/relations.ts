import { relations } from 'drizzle-orm';
import {
  businessHours, businessHourPeriods,
  holidayRules, holidayOverrides, holidayOverridePeriods,
  specialDates, specialDatePeriods,
  authSessions, auditLogs,
} from './index';
import { branches } from '../merchant';
import { users } from '../customer';

export const businessHoursRelations = relations(businessHours, ({ one, many }) => ({
  branch: one(branches, {
    fields: [businessHours.branch_id],
    references: [branches.id],
  }),
  periods: many(businessHourPeriods),
}));

export const businessHourPeriodsRelations = relations(businessHourPeriods, ({ one }) => ({
  businessHour: one(businessHours, {
    fields: [businessHourPeriods.business_hour_id],
    references: [businessHours.id],
  }),
}));

export const holidayRulesRelations = relations(holidayRules, ({ many }) => ({
  overrides: many(holidayOverrides),
}));

export const holidayOverridesRelations = relations(holidayOverrides, ({ one, many }) => ({
  branch: one(branches, {
    fields: [holidayOverrides.branch_id],
    references: [branches.id],
  }),
  holidayRule: one(holidayRules, {
    fields: [holidayOverrides.holiday_rule_id],
    references: [holidayRules.id],
  }),
  periods: many(holidayOverridePeriods),
}));

export const holidayOverridePeriodsRelations = relations(holidayOverridePeriods, ({ one }) => ({
  holidayOverride: one(holidayOverrides, {
    fields: [holidayOverridePeriods.holiday_override_id],
    references: [holidayOverrides.id],
  }),
}));

export const specialDatesRelations = relations(specialDates, ({ one, many }) => ({
  branch: one(branches, {
    fields: [specialDates.branch_id],
    references: [branches.id],
  }),
  periods: many(specialDatePeriods),
}));

export const specialDatePeriodsRelations = relations(specialDatePeriods, ({ one }) => ({
  specialDate: one(specialDates, {
    fields: [specialDatePeriods.special_date_id],
    references: [specialDates.id],
  }),
}));

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, {
    fields: [authSessions.user_id],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.user_id],
    references: [users.id],
  }),
}));
