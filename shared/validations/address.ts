import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória').max(200),
  number: z.string().min(1, 'Número é obrigatório').max(20),
  complement: z.string().max(200).optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório').max(100),
  city: z.string().min(1, 'Cidade é obrigatória').max(100),
  state: z.string().length(2, 'UF deve ter 2 caracteres'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido').max(9).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const addressAutocompleteSchema = z.object({
  query: z.string().min(3, 'Digite pelo menos 3 caracteres'),
});

export type AddressInput = z.infer<typeof addressSchema>;
