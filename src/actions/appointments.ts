'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { appointmentSchema } from '@/lib/validations/appointment'

interface AppointmentWithRelations {
  id: string
  store_id: string
  client_id: string
  staff_id: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  services: { id: string; name: string; price: number }[]
  products: { id: string; name: string; price: number; quantity: number }[]
  subtotal: number
  discount: number
  total: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  created_at: string
  client: { id: string; name: string; phone: string | null }
  staff: { id: string; name: string }
}

export async function getAppointments(storeId: string, date?: string): Promise<AppointmentWithRelations[]> {
  const supabase = await createClient()

  let query = supabase
    .from('appointments')
    .select(`
      *,
      client:clients(id, name, phone),
      staff:users(id, name)
    `)
    .eq('store_id', storeId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (date) {
    query = query.eq('date', date)
  } else {
    // Default to today and future
    const today = new Date().toISOString().split('T')[0]
    query = query.gte('date', today)
  }

  const { data, error } = await query

  if (error) throw error

  return (data ?? []).map(item => ({
    ...item,
    client: Array.isArray(item.client) ? item.client[0] : item.client,
    staff: Array.isArray(item.staff) ? item.staff[0] : item.staff,
  })) as AppointmentWithRelations[]
}

export async function getTodayAppointments(storeId: string): Promise<AppointmentWithRelations[]> {
  const today = new Date().toISOString().split('T')[0]
  return getAppointments(storeId, today)
}

export async function getAppointment(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(id, name, phone, email),
      staff:users(id, name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  return {
    ...data,
    client: Array.isArray(data.client) ? data.client[0] : data.client,
    staff: Array.isArray(data.staff) ? data.staff[0] : data.staff,
  }
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMinutes = totalMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
}

export async function createAppointmentAction(formData: FormData) {
  const supabase = await createClient()

  const raw = {
    store_id: formData.get('store_id') as string,
    client_id: formData.get('client_id') as string,
    staff_id: formData.get('staff_id') as string,
    date: formData.get('date') as string,
    start_time: formData.get('start_time') as string,
    duration_minutes: formData.get('duration_minutes') as string,
    services: formData.get('services') as string,
    notes: formData.get('notes') as string,
    status: formData.get('status') as string || 'scheduled',
  }

  const result = appointmentSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  // Parse services
  let servicesData: { id: string; name: string; price: number }[] = []
  let subtotal = 0

  if (raw.services) {
    const serviceIds = raw.services.split(',').filter(Boolean)
    if (serviceIds.length > 0) {
      const { data: services } = await supabase
        .from('services')
        .select('id, name, price')
        .in('id', serviceIds)

      if (services) {
        servicesData = services
        subtotal = services.reduce((sum, s) => sum + Number(s.price), 0)
      }
    }
  }

  const end_time = calculateEndTime(result.data.start_time, result.data.duration_minutes)

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      store_id: result.data.store_id,
      client_id: result.data.client_id,
      staff_id: result.data.staff_id,
      date: result.data.date,
      start_time: result.data.start_time,
      end_time,
      duration_minutes: result.data.duration_minutes,
      services: servicesData,
      subtotal,
      total: subtotal,
      status: result.data.status,
      notes: result.data.notes || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/appointments')
  revalidatePath('/')
  return { data }
}

export async function updateAppointmentStatusAction(id: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/appointments')
  revalidatePath('/')
  return { success: true }
}

export async function cancelAppointmentAction(id: string) {
  return updateAppointmentStatusAction(id, 'cancelled')
}

export async function completeAppointmentAction(id: string) {
  return updateAppointmentStatusAction(id, 'completed')
}

export async function getAvailableStaff(storeId: string): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_stores')
    .select(`
      user_id,
      user:users(id, name)
    `)
    .eq('store_id', storeId)
    .eq('is_active', true)

  if (error) throw error

  const result: { id: string; name: string }[] = []
  for (const item of data ?? []) {
    const user = item.user as { id: string; name: string } | { id: string; name: string }[] | null
    if (user) {
      const u = Array.isArray(user) ? user[0] : user
      if (u?.id && u?.name) {
        result.push({ id: u.id, name: u.name })
      }
    }
  }
  return result
}

export async function getActiveServices(storeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('id, name, price, duration_minutes')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getActiveClients(storeId: string, search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('clients')
    .select('id, name, phone')
    .eq('store_id', storeId)
    .is('deleted_at', null)
    .order('name')
    .limit(50)

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
