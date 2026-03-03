'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { serviceServerSchema } from '@/lib/validations/service'

export async function getServices(storeId: string, search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('services')
    .select('*')
    .eq('store_id', storeId)
    .is('deleted_at', null)
    .order('sort_order')
    .order('name')

  if (search) {
    query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getService(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createServiceAction(formData: FormData) {
  const supabase = await createClient()

  const raw = {
    store_id: formData.get('store_id') as string,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    duration_minutes: formData.get('duration_minutes') as string,
    category: formData.get('category') as string,
    is_active: formData.get('is_active') === 'true',
    sort_order: formData.get('sort_order') as string,
  }

  const result = serviceServerSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { data, error } = await supabase
    .from('services')
    .insert(result.data)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/services')
  return { data }
}

export async function updateServiceAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const raw = {
    store_id: formData.get('store_id') as string,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    duration_minutes: formData.get('duration_minutes') as string,
    category: formData.get('category') as string,
    is_active: formData.get('is_active') === 'true',
    sort_order: formData.get('sort_order') as string,
  }

  const result = serviceServerSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { data, error } = await supabase
    .from('services')
    .update(result.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/services')
  return { data }
}

export async function deleteServiceAction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('services')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/services')
  return { success: true }
}

export async function toggleServiceActiveAction(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/services')
  return { success: true }
}
