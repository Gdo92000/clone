import { z } from 'zod';

export const globalCouponResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.string(),
  min_order: z.string().nullable(),
  max_uses: z.number().int().positive(),
  current_uses: z.number().int().nonnegative(),
  valid_from: z.string(),
  valid_until: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export const globalCouponListResponseSchema = z.array(globalCouponResponseSchema);

export const createGlobalCouponSchema = z.object({
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.string(),
  min_order: z.string().optional(),
  max_uses: z.number().int().positive().optional(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime(),
});

export const updateGlobalCouponSchema = createGlobalCouponSchema.partial();

export type GlobalCouponResponse = z.infer<typeof globalCouponResponseSchema>;
export type GlobalCouponListResponse = z.infer<typeof globalCouponListResponseSchema>;
export type CreateGlobalCouponInput = z.infer<typeof createGlobalCouponSchema>;
