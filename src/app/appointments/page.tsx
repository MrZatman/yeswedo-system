import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppointmentsTable } from '@/components/appointments/AppointmentsTable'
import { AppointmentModal } from '@/components/appointments/AppointmentModal'
import { getAppointments } from '@/actions/appointments'

export default async function AppointmentsPage() {
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

  const appointments = await getAppointments(userStore.store_id)
  const userName = profile?.name || user.email?.split('@')[0] || 'User'

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} />
      <main className="flex-1 bg-gray-50 p-6">
        <div className="bg-[#8B3A3A] text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">APPOINTMENTS</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
            <AppointmentModal storeId={userStore.store_id} />
          </div>
          <AppointmentsTable appointments={appointments} />
        </div>
      </main>
    </div>
  )
}
