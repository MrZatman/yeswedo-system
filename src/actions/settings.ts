'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string

  const { error } = await supabase
    .from('users')
    .update({ name, phone })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/')
  return { success: true }
}

export async function updateStoreAction(storeId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Verify user is manager of this store
  const { data: userStore } = await supabase
    .from('user_stores')
    .select('role')
    .eq('user_id', user.id)
    .eq('store_id', storeId)
    .single()

  if (!userStore || (userStore.role !== 'super_admin' && userStore.role !== 'store_manager')) {
    return { error: 'Not authorized' }
  }

  const updateData = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zip_code: formData.get('zip_code') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
  }

  const { error } = await supabase
    .from('stores')
    .update(updateData)
    .eq('id', storeId)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}
