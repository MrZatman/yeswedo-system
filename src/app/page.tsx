import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Clock, DollarSign } from 'lucide-react'
import { getUserStores } from '@/actions/stores'
import { getDashboardStats, getRecentAppointments } from '@/actions/reports'
import { getActiveClockRecord } from '@/actions/clock'
import { ClockWidget } from '@/components/clock/ClockWidget'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  // Get user's stores with details
  const stores = await getUserStores(user.id)
  const hasStore = stores && stores.length > 0
  const userName = profile?.name || user.email?.split('@')[0] || 'User'

  // Get current store
  const currentStore = stores.find(s => s.is_default) || stores[0]
  const currentStoreId = currentStore?.store_id

  // Get dashboard data
  let stats = null
  let todayAppointments: { id: string; date: string; start_time: string; total: number; status: string; client: { name: string } | null; staff: { name: string } | null }[] = []
  let activeClockRecord = null

  if (currentStoreId) {
    const today = new Date().toISOString().split('T')[0]
    stats = await getDashboardStats(currentStoreId)
    const appointments = await getRecentAppointments(currentStoreId, 20)
    todayAppointments = appointments.filter(a => a.date === today)
    activeClockRecord = await getActiveClockRecord(user.id, currentStoreId)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${minutes} ${ampm}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={userName}
        stores={stores}
        currentStoreId={currentStoreId}
      />
      <main className="flex-1 bg-gray-50 p-6">
        <div className="bg-[#8B3A3A] text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">MY WORK TODAY</h1>
          {currentStore && (
            <p className="text-sm opacity-80 mt-1">{currentStore.store.name}</p>
          )}
        </div>

        {!hasStore ? (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Welcome to YesWeDo!</h2>
              <p className="text-gray-600">
                You don&apos;t have any store assigned yet. Contact your administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Today&apos;s Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.todayAppointments ?? 0}</div>
                  <p className="text-xs text-gray-500">{formatCurrency(stats?.todayRevenue ?? 0)} revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">This Week</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.weekAppointments ?? 0}</div>
                  <p className="text-xs text-gray-500">{formatCurrency(stats?.weekRevenue ?? 0)} revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Active Clients</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeClients ?? 0}</div>
                  <p className="text-xs text-gray-500">{stats?.activeMemberships ?? 0} memberships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">This Month</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats?.monthRevenue ?? 0)}</div>
                  <p className="text-xs text-gray-500">{stats?.monthAppointments ?? 0} appointments</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Today&apos;s Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todayAppointments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No appointments scheduled for today.</p>
                    ) : (
                      <div className="space-y-3">
                        {todayAppointments.map((apt) => (
                          <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium">{formatTime(apt.start_time)}</div>
                              <div>
                                <p className="font-medium">{apt.client?.name ?? 'Unknown'}</p>
                                <p className="text-sm text-gray-500">with {apt.staff?.name ?? 'Staff'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatCurrency(apt.total)}</span>
                              <Badge variant={apt.status === 'completed' ? 'default' : 'outline'}>
                                {apt.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <ClockWidget storeId={currentStoreId!} activeRecord={activeClockRecord} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
