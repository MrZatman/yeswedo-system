import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { ClockWidget } from '@/components/clock/ClockWidget'
import { ClockRecordsTable } from '@/components/clock/ClockRecordsTable'
import { getActiveClockRecord, getWeekClockRecords } from '@/actions/clock'

export default async function ClockPage() {
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
    .select('store_id, role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .eq('is_default', true)
    .single()

  if (!userStore) redirect('/')

  const activeRecord = await getActiveClockRecord(user.id, userStore.store_id)
  const isManager = userStore.role === 'super_admin' || userStore.role === 'store_manager'
  const records = await getWeekClockRecords(userStore.store_id, isManager ? undefined : user.id)
  const userName = profile?.name || user.email?.split('@')[0] || 'User'

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} />
      <main className="flex-1 bg-gray-50 p-6">
        <div className="bg-[#8B3A3A] text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">CLOCK IN & OUT</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ClockWidget storeId={userStore.store_id} activeRecord={activeRecord} />
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isManager ? 'All Staff - Last 7 Days' : 'Your Records - Last 7 Days'}
            </h2>
            <ClockRecordsTable records={records} />
          </div>
        </div>
      </main>
    </div>
  )
}
