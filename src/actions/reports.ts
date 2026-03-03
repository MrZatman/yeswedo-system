'use server'

import { createClient } from '@/lib/supabase/server'

interface DashboardStats {
  todayAppointments: number
  todayRevenue: number
  weekAppointments: number
  weekRevenue: number
  monthAppointments: number
  monthRevenue: number
  activeClients: number
  activeMemberships: number
}

interface TopService {
  name: string
  count: number
  revenue: number
}

interface StaffPerformance {
  name: string
  appointments: number
  revenue: number
  hoursWorked: number
}

export async function getDashboardStats(storeId: string): Promise<DashboardStats> {
  const supabase = await createClient()

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekStart = weekAgo.toISOString().split('T')[0]

  const monthAgo = new Date(now)
  monthAgo.setDate(monthAgo.getDate() - 30)
  const monthStart = monthAgo.toISOString().split('T')[0]

  // Today's appointments
  const { count: todayAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('date', today)
    .in('status', ['scheduled', 'confirmed', 'in_progress', 'completed'])

  // Today's revenue
  const { data: todayData } = await supabase
    .from('appointments')
    .select('total')
    .eq('store_id', storeId)
    .eq('date', today)
    .eq('status', 'completed')

  const todayRevenue = todayData?.reduce((sum, a) => sum + Number(a.total), 0) ?? 0

  // Week stats
  const { count: weekAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .gte('date', weekStart)
    .in('status', ['scheduled', 'confirmed', 'in_progress', 'completed'])

  const { data: weekData } = await supabase
    .from('appointments')
    .select('total')
    .eq('store_id', storeId)
    .gte('date', weekStart)
    .eq('status', 'completed')

  const weekRevenue = weekData?.reduce((sum, a) => sum + Number(a.total), 0) ?? 0

  // Month stats
  const { count: monthAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .gte('date', monthStart)
    .in('status', ['scheduled', 'confirmed', 'in_progress', 'completed'])

  const { data: monthData } = await supabase
    .from('appointments')
    .select('total')
    .eq('store_id', storeId)
    .gte('date', monthStart)
    .eq('status', 'completed')

  const monthRevenue = monthData?.reduce((sum, a) => sum + Number(a.total), 0) ?? 0

  // Active clients count
  const { count: activeClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .is('deleted_at', null)

  // Active memberships
  const { count: activeMemberships } = await supabase
    .from('client_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('status', 'active')

  return {
    todayAppointments: todayAppointments ?? 0,
    todayRevenue,
    weekAppointments: weekAppointments ?? 0,
    weekRevenue,
    monthAppointments: monthAppointments ?? 0,
    monthRevenue,
    activeClients: activeClients ?? 0,
    activeMemberships: activeMemberships ?? 0,
  }
}

export async function getTopServices(storeId: string, days: number = 30): Promise<TopService[]> {
  const supabase = await createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data } = await supabase
    .from('appointments')
    .select('services')
    .eq('store_id', storeId)
    .gte('date', startDate.toISOString().split('T')[0])
    .eq('status', 'completed')

  const serviceCounts: Record<string, { count: number; revenue: number }> = {}

  for (const apt of data ?? []) {
    const services = apt.services as { name: string; price: number }[]
    for (const service of services) {
      if (!serviceCounts[service.name]) {
        serviceCounts[service.name] = { count: 0, revenue: 0 }
      }
      serviceCounts[service.name].count++
      serviceCounts[service.name].revenue += service.price
    }
  }

  return Object.entries(serviceCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

export async function getStaffPerformance(storeId: string, days: number = 30): Promise<StaffPerformance[]> {
  const supabase = await createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  // Get appointments by staff
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      staff_id,
      total,
      staff:users(name)
    `)
    .eq('store_id', storeId)
    .gte('date', startDateStr)
    .eq('status', 'completed')

  // Get clock records by staff
  const { data: clockRecords } = await supabase
    .from('clock_records')
    .select('user_id, hours_worked')
    .eq('store_id', storeId)
    .gte('clock_in', startDate.toISOString())
    .eq('status', 'completed')

  const staffStats: Record<string, { name: string; appointments: number; revenue: number; hours: number }> = {}

  for (const apt of appointments ?? []) {
    const staffName = (apt.staff as { name: string } | { name: string }[] | null)
    const name = Array.isArray(staffName) ? staffName[0]?.name : staffName?.name
    if (!name) continue

    if (!staffStats[apt.staff_id]) {
      staffStats[apt.staff_id] = { name, appointments: 0, revenue: 0, hours: 0 }
    }
    staffStats[apt.staff_id].appointments++
    staffStats[apt.staff_id].revenue += Number(apt.total)
  }

  for (const record of clockRecords ?? []) {
    if (staffStats[record.user_id]) {
      staffStats[record.user_id].hours += record.hours_worked ?? 0
    }
  }

  return Object.values(staffStats)
    .map(s => ({
      name: s.name,
      appointments: s.appointments,
      revenue: s.revenue,
      hoursWorked: Math.round(s.hours * 10) / 10,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

export async function getRecentAppointments(storeId: string, limit: number = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      date,
      start_time,
      total,
      status,
      client:clients(name),
      staff:users(name)
    `)
    .eq('store_id', storeId)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map(apt => ({
    ...apt,
    client: Array.isArray(apt.client) ? apt.client[0] : apt.client,
    staff: Array.isArray(apt.staff) ? apt.staff[0] : apt.staff,
  }))
}
