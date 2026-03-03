import { z } from 'zod'

export const productServerSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')),
  sku: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be positive'),
  cost: z.coerce.number().min(0, 'Cost must be positive').optional().or(z.literal('')),
  quantity_in_stock: z.coerce.number().min(0, 'Quantity must be positive'),
  low_stock_threshold: z.coerce.number().min(0, 'Threshold must be positive'),
  category: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
})

export type ProductFormData = z.output<typeof productServerSchema>
