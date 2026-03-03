import { z } from 'zod'

export const membershipPlanSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  shortcode: z.string().min(2, 'Shortcode must be at least 2 characters').max(10),
  description: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be positive'),
  billing_period: z.enum(['monthly', 'yearly']),
  haircuts_included: z.coerce.number().min(0, 'Must be 0 or more'),
  discount_percentage: z.coerce.number().min(0).max(100),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
})

export type MembershipPlanFormData = z.output<typeof membershipPlanSchema>
