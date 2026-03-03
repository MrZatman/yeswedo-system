'use server'

import { createClient } from '@/lib/supabase/server'

interface UserStoreWithDetails {
  id: string
  store_id: string
  is_default: boolean
  role: string
  store: {
    id: string
    name: string
    slug: string
  }
}

export async function getUserStores(userId: string): Promise<UserStoreWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_stores')
    .select(`
      id,
      store_id,
      is_default,
      role,
      store:stores(id, name, slug)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('is_default', { ascending: false })

  if (error) throw error

  return (data ?? []).map(item => ({
    ...item,
    store: Array.isArray(item.store) ? item.store[0] : item.store,
  })) as UserStoreWithDetails[]
}

export async function getCurrentStore(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_stores')
    .select(`
      store_id,
      role,
      store:stores(id, name, slug)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('is_default', true)
    .single()

  if (error) return null

  return {
    ...data,
    store: Array.isArray(data.store) ? data.store[0] : data.store,
  }
}
