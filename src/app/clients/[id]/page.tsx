import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getClient } from '@/actions/clients'
import { ClientModal } from '@/components/clients/ClientModal'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CreditCard } from 'lucide-react'
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

  const userName = profile?.name || user.email?.split('@')[0] || 'User'

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

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Membership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Badge variant="outline" className="mb-2">No active membership</Badge>
                <p className="text-sm">This client doesn&apos;t have an active membership plan.</p>
                <Button className="mt-4 bg-[#8B3A3A] hover:bg-[#722F2F]">
                  Assign Membership
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Visit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No visits recorded yet.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
