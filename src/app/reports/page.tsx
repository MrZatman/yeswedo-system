import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { StatsCards } from '@/components/reports/StatsCards'
import { TopServicesTable } from '@/components/reports/TopServicesTable'
import { StaffPerformanceTable } from '@/components/reports/StaffPerformanceTable'
import { RecentAppointmentsTable } from '@/components/reports/RecentAppointmentsTable'
import {
  getDashboardStats,
  getTopServices,
  getStaffPerformance,
  getRecentAppointments,
} from '@/actions/reports'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  const { data: userStore } = await supabase
    .from('user_stores')
    .select('store_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .eq('is_default', true)
    .single()

  if (!userStore) redirect('/')

  const [stats, topServices, staffPerformance, recentAppointments] = await Promise.all([
    getDashboardStats(userStore.store_id),
    getTopServices(userStore.store_id),
    getStaffPerformance(userStore.store_id),
    getRecentAppointments(userStore.store_id),
  ])

  const userName = profile?.name || user.email?.split('@')[0] || 'User'

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} />
      <main className="flex-1 bg-gray-50 p-6">
        <div className="bg-[#8B3A3A] text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">REPORTS</h1>
        </div>

        <div className="space-y-6">
          <StatsCards stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopServicesTable services={topServices} />
            <StaffPerformanceTable staff={staffPerformance} />
          </div>

          <RecentAppointmentsTable appointments={recentAppointments} />
        </div>
      </main>
    </div>
  )
}
