import { z } from 'zod';

export const cuisineEnum = z.enum([
  'pizza', 'hamburger', 'brazilian', 'japanese', 'mexican',
  'italian', 'chinese', 'healthy', 'dessert', 'cafe',
  'arabic', 'seafood', 'other',
]);

export const restaurantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().max(64).optional(),
  cuisine: cuisineEnum.default('other'),
  address: z.string().min(1, 'Endereço é obrigatório').max(200),
  number: z.string().max(20).optional(),
  neighborhood: z.string().max(100).optional(),
  city: z.string().min(1, 'Cidade é obrigatória').max(100),
  state: z.string().length(2, 'UF inválida'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido').max(9).optional(),
  phone: z.string().max(20).optional(),
  deliveryFee: z.coerce.number().min(0).optional(),
  deliveryTime: z.string().max(50).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const restaurantFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  category: z.string().max(64).optional(),
  maxDistance: z.coerce.number().positive().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  promotionsOnly: z.coerce.boolean().optional(),
});

export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type RestaurantFilters = z.infer<typeof restaurantFiltersSchema>;
