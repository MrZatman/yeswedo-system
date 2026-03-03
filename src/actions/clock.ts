'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface ClockRecordWithUser {
  id: string
  store_id: string
  user_id: string
  clock_in: string
  clock_out: string | null
  hours_worked: number | null
  break_minutes: number
  off_clock_amount: number
  status: 'active' | 'completed' | 'edited'
  notes: string | null
  created_at: string
  updated_at: string
  user: {
    id: string
    name: string
    email: string
  }
}

export async function getActiveClockRecord(userId: string, storeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clock_records')
    .select('*')
    .eq('user_id', userId)
    .eq('store_id', storeId)
    .eq('status', 'active')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getTodayClockRecords(storeId: string): Promise<ClockRecordWithUser[]> {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('clock_records')
    .select(`
      *,
      user:users(id, name, email)
    `)
    .eq('store_id', storeId)
    .gte('clock_in', today.toISOString())
    .order('clock_in', { ascending: false })

  if (error) throw error

  return (data ?? []).map(item => ({
    ...item,
    user: Array.isArray(item.user) ? item.user[0] : item.user
  })) as ClockRecordWithUser[]
}

export async function getWeekClockRecords(storeId: string, userId?: string): Promise<ClockRecordWithUser[]> {
  const supabase = await createClient()

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)

  let query = supabase
    .from('clock_records')
    .select(`
      *,
      user:users(id, name, email)
    `)
    .eq('store_id', storeId)
    .gte('clock_in', weekAgo.toISOString())
    .order('clock_in', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) throw error

  return (data ?? []).map(item => ({
    ...item,
    user: Array.isArray(item.user) ? item.user[0] : item.user
  })) as ClockRecordWithUser[]
}

export async function clockInAction(storeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check if already clocked in
  const { data: existing } = await supabase
    .from('clock_records')
    .select('id')
    .eq('user_id', user.id)
    .eq('store_id', storeId)
    .eq('status', 'active')
    .single()

  if (existing) {
    return { error: 'Already clocked in' }
  }

  const { data, error } = await supabase
    .from('clock_records')
    .insert({
      user_id: user.id,
      store_id: storeId,
      clock_in: new Date().toISOString(),
      status: 'active',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/clock')
  revalidatePath('/')
  return { data }
}

export async function clockOutAction(recordId: string) {
  const supabase = await createClient()

  const { data: record } = await supabase
    .from('clock_records')
    .select('clock_in, break_minutes')
    .eq('id', recordId)
    .single()

  if (!record) return { error: 'Record not found' }

  const clockIn = new Date(record.clock_in)
  const clockOut = new Date()
  const totalMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / 1000 / 60)
  const hoursWorked = (totalMinutes - record.break_minutes) / 60

  const { data, error } = await supabase
    .from('clock_records')
    .update({
      clock_out: clockOut.toISOString(),
      hours_worked: Math.round(hoursWorked * 100) / 100,
      status: 'completed',
    })
    .eq('id', recordId)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/clock')
  revalidatePath('/')
  return { data }
}

export async function addBreakAction(recordId: string, minutes: number) {
  const supabase = await createClient()

  const { data: record } = await supabase
    .from('clock_records')
    .select('break_minutes')
    .eq('id', recordId)
    .single()

  if (!record) return { error: 'Record not found' }

  const { error } = await supabase
    .from('clock_records')
    .update({
      break_minutes: record.break_minutes + minutes,
    })
    .eq('id', recordId)

  if (error) return { error: error.message }

  revalidatePath('/clock')
  return { success: true }
}

export async function updateClockRecordAction(
  recordId: string,
  data: {
    clock_in?: string
    clock_out?: string | null
    break_minutes?: number
    notes?: string
  }
) {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = { ...data, status: 'edited' }

  // Recalculate hours if times changed
  if (data.clock_in || data.clock_out) {
    const { data: record } = await supabase
      .from('clock_records')
      .select('clock_in, clock_out, break_minutes')
      .eq('id', recordId)
      .single()

    if (record) {
      const clockIn = new Date(data.clock_in || record.clock_in)
      const clockOut = data.clock_out ? new Date(data.clock_out) : record.clock_out ? new Date(record.clock_out) : null

      if (clockOut) {
        const totalMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / 1000 / 60)
        const breakMins = data.break_minutes ?? record.break_minutes
        updateData.hours_worked = Math.round((totalMinutes - breakMins) / 60 * 100) / 100
      }
    }
  }

  const { error } = await supabase
    .from('clock_records')
    .update(updateData)
    .eq('id', recordId)

  if (error) return { error: error.message }

  revalidatePath('/clock')
  return { success: true }
}
