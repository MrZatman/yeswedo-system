import { z } from 'zod'

export const appointmentSchema = z.object({
  store_id: z.string().uuid(),
  client_id: z.string().uuid('Please select a client'),
  staff_id: z.string().uuid('Please select a staff member'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  duration_minutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes'),
  services: z.string().optional(), // JSON string of service IDs
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).default('scheduled'),
})

export type AppointmentFormData = z.output<typeof appointmentSchema>
