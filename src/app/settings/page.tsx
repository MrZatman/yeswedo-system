import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getUserStores } from '@/actions/stores'
import { SettingsForm } from '@/components/settings/SettingsForm'
import { Store, User, Bell } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const stores = await getUserStores(user.id)
  const currentStore = stores.find(s => s.is_default) || stores[0]
  const userName = profile?.name || user.email?.split('@')[0] || 'User'

  // Get store details
  let storeDetails = null
  if (currentStore) {
    const { data } = await supabase
      .from('stores')
      .select('*')
      .eq('id', currentStore.store_id)
      .single()
    storeDetails = data
  }

  const isManager = currentStore?.role === 'super_admin' || currentStore?.role === 'store_manager'

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={userName}
        stores={stores}
        currentStoreId={currentStore?.store_id}
      />
      <main className="flex-1 bg-gray-50 p-6">
        <div className="bg-[#8B3A3A] text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">SETTINGS</h1>
        </div>

        <div className="space-y-6 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm
                type="profile"
                data={{
                  name: profile?.name ?? '',
                  email: user.email ?? '',
                  phone: profile?.phone ?? '',
                }}
              />
            </CardContent>
          </Card>

          {isManager && storeDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Store Settings
                </CardTitle>
                <CardDescription>Manage {storeDetails.name} settings</CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsForm
                  type="store"
                  storeId={storeDetails.id}
                  data={{
                    name: storeDetails.name,
                    address: storeDetails.address ?? '',
                    city: storeDetails.city ?? '',
                    state: storeDetails.state ?? '',
                    zip_code: storeDetails.zip_code ?? '',
                    phone: storeDetails.phone ?? '',
                    email: storeDetails.email ?? '',
                  }}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-4">
                Notification settings coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
