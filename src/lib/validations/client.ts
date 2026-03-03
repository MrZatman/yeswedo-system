import { z } from 'zod'

export const clientSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zip_code: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type ClientFormData = z.infer<typeof clientSchema>
