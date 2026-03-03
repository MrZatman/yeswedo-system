'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations/client'

export async function getClients(storeId: string, search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('clients')
    .select('*')
    .eq('store_id', storeId)
    .is('deleted_at', null)
    .order('name')

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getClient(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()

  const raw = {
    store_id: formData.get('store_id') as string,
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zip_code: formData.get('zip_code') as string,
    notes: formData.get('notes') as string,
  }

  const result = clientSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert(result.data)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/clients')
  return { data }
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const raw = {
    store_id: formData.get('store_id') as string,
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zip_code: formData.get('zip_code') as string,
    notes: formData.get('notes') as string,
  }

  const result = clientSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { data, error } = await supabase
    .from('clients')
    .update(result.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return { data }
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/clients')
  return { success: true }
}
