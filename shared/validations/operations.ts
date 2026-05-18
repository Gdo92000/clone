import { z } from 'zod';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeSchema = z.string().regex(HHMM, 'Formato HH:MM inválido');

const weekDayEnum = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

const holidayScopeEnum = z.enum(['national', 'state', 'municipal']);
const holidayOverrideTypeEnum = z.enum(['closed', 'open_normal', 'custom_hours']);

export const businessHourPeriodSchema = z.object({
  openTime: timeSchema,
  closeTime: timeSchema,
  sortOrder: z.number().int().min(0).default(0),
}).refine(
  (d) => d.openTime !== d.closeTime,
  { message: 'Horário de abertura e fechamento não podem ser iguais', path: ['closeTime'] },
);

export const businessHourSchema = z.object({
  branchId: z.string().min(1).max(64),
  weekday: weekDayEnum,
  isClosed: z.boolean().default(false),
  is24h: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  periods: z.array(businessHourPeriodSchema).default([]),
}).refine(
  (d) => d.isClosed || d.is24h || d.periods.length > 0,
  { message: 'Informe ao menos um período de funcionamento', path: ['periods'] },
);

export const holidayRuleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato AAAA-MM-DD'),
  scope: holidayScopeEnum,
  stateCode: z.string().max(50).optional(),
  cityCode: z.string().max(50).optional(),
  isRecurring: z.boolean().default(true),
  year: z.number().int().optional(),
});

export const holidayOverridePeriodSchema = z.object({
  openTime: timeSchema,
  closeTime: timeSchema,
  sortOrder: z.number().int().min(0).default(0),
});

export const holidayOverrideSchema = z.object({
  branchId: z.string().min(1).max(64),
  holidayRuleId: z.string().max(64).optional(),
  overrideType: holidayOverrideTypeEnum,
  customDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato AAAA-MM-DD'),
  periods: z.array(holidayOverridePeriodSchema).default([]),
}).refine(
  (d) => d.overrideType !== 'custom_hours' || d.periods.length > 0,
  { message: 'Informe ao menos um período para horário customizado', path: ['periods'] },
);

export const specialDatePeriodSchema = z.object({
  openTime: timeSchema,
  closeTime: timeSchema,
  sortOrder: z.number().int().min(0).default(0),
});

export const specialDateSchema = z.object({
  branchId: z.string().min(1).max(64),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato AAAA-MM-DD'),
  label: z.string().max(100).optional(),
  isClosed: z.boolean().default(false),
  is24h: z.boolean().default(false),
  periods: z.array(specialDatePeriodSchema).default([]),
}).refine(
  (d) => d.isClosed || d.is24h || d.periods.length > 0,
  { message: 'Informe ao menos um período de funcionamento', path: ['periods'] },
);

export const weeklyHoursSchema = z.object({
  branchId: z.string().min(1).max(64),
  hours: z.array(businessHourSchema),
});

export type BusinessHourInput = z.infer<typeof businessHourSchema>;
export type BusinessHourPeriodInput = z.infer<typeof businessHourPeriodSchema>;
export type HolidayRuleInput = z.infer<typeof holidayRuleSchema>;
export type HolidayOverrideInput = z.infer<typeof holidayOverrideSchema>;
export type HolidayOverridePeriodInput = z.infer<typeof holidayOverridePeriodSchema>;
export type SpecialDateInput = z.infer<typeof specialDateSchema>;
export type SpecialDatePeriodInput = z.infer<typeof specialDatePeriodSchema>;
export type WeeklyHoursInput = z.infer<typeof weeklyHoursSchema>;
