import { z } from 'zod';

export const planResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  monthly_price: z.string(),
  description: z.string().nullable().optional(),
  max_branches: z.number().int().nullable().optional(),
  max_products: z.number().int().nullable().optional(),
  max_users: z.number().int().nullable().optional(),
  max_campaigns: z.number().int().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().nullable().optional(),
});

export const planListResponseSchema = z.array(planResponseSchema);

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  monthly_price: z.string(),
  description: z.string().optional(),
  max_branches: z.number().int().optional(),
  max_products: z.number().int().optional(),
  max_users: z.number().int().optional(),
  max_campaigns: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export type PlanResponse = z.infer<typeof planResponseSchema>;
export type PlanListResponse = z.infer<typeof planListResponseSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
