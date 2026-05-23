import { z } from 'zod';

/**
 * Schema Zod de resposta para Cidade de Cobertura.
 *
 * É a fonte de truth compartilhada entre backend e MSW.
 * Qualquer divergência entre esse schema e o drizzle schema
 * deve ser detectada pelo contrato de testes.
 */
export const coverageCityResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  radius_km: z.number().int().nonnegative(),
  restaurant_count: z.number().int().nonnegative(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export const coverageCityListResponseSchema = z.array(coverageCityResponseSchema);

export const coverageCityInputSchema = z.object({
  name: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  latitude: z.string(),
  longitude: z.string(),
  radiusKm: z.number().int().min(1).max(200).optional(),
});

export type CoverageCityResponse = z.infer<typeof coverageCityResponseSchema>;
export type CoverageCityListResponse = z.infer<typeof coverageCityListResponseSchema>;
export type CoverageCityInput = z.infer<typeof coverageCityInputSchema>;
