import { z } from 'zod'

export const staffInviteSchema = z.object({
  store_id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['store_manager', 'staff']),
})

export type StaffInviteData = z.infer<typeof staffInviteSchema>

export const staffUpdateSchema = z.object({
  role: z.enum(['store_manager', 'staff']),
  is_active: z.boolean(),
})

export type StaffUpdateData = z.infer<typeof staffUpdateSchema>
