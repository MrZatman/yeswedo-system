import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getClient } from '@/actions/clients'
import { getActiveClientMembership } from '@/actions/client-memberships'
import { ClientModal } from '@/components/clients/ClientModal'
import { ClientMembershipCard } from '@/components/clients/ClientMembershipCard'
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  let client
  try {
    client = await getClient(id)
  } catch {
    notFound()
  }

  if (!client || client.store_id !== userStore.store_id) {
    notFound()
  }

  // Get client membership
  const membership = await getActiveClientMembership(id)

  // Get client's appointments (visit history)
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      date,
      start_time,
      total,
      status,
      services,
      staff:users(name)
    `)
    .eq('client_id', id)
    .eq('status', 'completed')
    .order('date', { ascending: false })
    .limit(10)

  const userName = profile?.name || user.email?.split('@')[0] || 'User'

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} />
      <main className="flex-1 bg-gray-50 p-6">
        <div className="bg-[#8B3A3A] text-white p-6 rounded-lg mb-6">
          <div className="flex items-center gap-4">
            <Link href="/clients">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">CLIENT PROFILE</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{client.name}</CardTitle>
                  <p className="text-sm text-gray-500 font-mono">ID: {client.id.slice(0, 8)}</p>
                </div>
                <ClientModal
                  storeId={userStore.store_id}
                  client={client}
                  trigger={<Button variant="outline">Edit</Button>}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
              )}
              {(client.address || client.city) && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {[client.address, client.city, client.state, client.zip_code]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
              {client.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <ClientMembershipCard
              clientId={id}
              storeId={userStore.store_id}
              membership={membership}
            />
          </div>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Visit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!appointments || appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No visits recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => {
                    const staff = Array.isArray(apt.staff) ? apt.staff[0] : apt.staff
                    const services = apt.services as { name: string }[]
                    return (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{formatDate(apt.date)}</p>
                          <p className="text-sm text-gray-500">
                            {services.map(s => s.name).join(', ') || 'No services'} • by {staff?.name ?? 'Staff'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(apt.total)}</p>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
