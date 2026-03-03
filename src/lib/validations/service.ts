import { z } from 'zod'

export const serviceSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')),
  price: z.number().min(0, 'Price must be positive'),
  duration_minutes: z.number().min(5, 'Duration must be at least 5 minutes'),
  category: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
})

// For server action parsing with string coercion
export const serviceServerSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be positive'),
  duration_minutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes'),
  category: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
})

export type ServiceFormData = z.infer<typeof serviceSchema>
