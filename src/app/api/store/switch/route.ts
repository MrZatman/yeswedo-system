import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { storeId } = await request.json()

  if (!storeId) {
    return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
  }

  // Verify user has access to this store
  const { data: userStore } = await supabase
    .from('user_stores')
    .select('id')
    .eq('user_id', user.id)
    .eq('store_id', storeId)
    .eq('is_active', true)
    .single()

  if (!userStore) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Set all user's stores to non-default
  await supabase
    .from('user_stores')
    .update({ is_default: false })
    .eq('user_id', user.id)

  // Set selected store as default
  await supabase
    .from('user_stores')
    .update({ is_default: true })
    .eq('user_id', user.id)
    .eq('store_id', storeId)

  return NextResponse.json({ success: true })
}
