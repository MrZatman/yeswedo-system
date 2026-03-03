'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { staffInviteSchema } from '@/lib/validations/staff'

interface StaffMember {
  id: string
  user_id: string
  store_id: string
  role: 'super_admin' | 'store_manager' | 'staff'
  is_active: boolean
  is_default: boolean
  created_at: string
  user: {
    id: string
    email: string
    name: string
    phone: string | null
    avatar_url: string | null
  }
}

export async function getStaffMembers(storeId: string): Promise<StaffMember[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_stores')
    .select(`
      id,
      user_id,
      store_id,
      role,
      is_active,
      is_default,
      created_at,
      user:users(id, email, name, phone, avatar_url)
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map(item => ({
    ...item,
    user: Array.isArray(item.user) ? item.user[0] : item.user
  })) as StaffMember[]
}

export async function inviteStaffAction(formData: FormData) {
  const supabase = await createClient()

  const raw = {
    store_id: formData.get('store_id') as string,
    email: formData.get('email') as string,
    name: formData.get('name') as string,
    role: formData.get('role') as string,
  }

  const result = staffInviteSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', result.data.email)
    .single()

  let userId: string

  if (existingUser) {
    // Check if already in store
    const { data: existingAssignment } = await supabase
      .from('user_stores')
      .select('id')
      .eq('user_id', existingUser.id)
      .eq('store_id', result.data.store_id)
      .single()

    if (existingAssignment) {
      return { error: 'This user is already a member of this store' }
    }

    userId = existingUser.id
  } else {
    // Create new user record (they'll need to sign up later)
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email: result.data.email,
        name: result.data.name,
      })
      .select()
      .single()

    if (createError) return { error: createError.message }
    userId = newUser.id
  }

  // Add to store
  const { error: assignError } = await supabase
    .from('user_stores')
    .insert({
      user_id: userId,
      store_id: result.data.store_id,
      role: result.data.role,
      is_active: true,
      is_default: false,
    })

  if (assignError) return { error: assignError.message }

  revalidatePath('/staff')
  return { success: true }
}

export async function updateStaffRoleAction(userStoreId: string, role: 'store_manager' | 'staff') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_stores')
    .update({ role })
    .eq('id', userStoreId)

  if (error) return { error: error.message }

  revalidatePath('/staff')
  return { success: true }
}

export async function toggleStaffActiveAction(userStoreId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_stores')
    .update({ is_active: isActive })
    .eq('id', userStoreId)

  if (error) return { error: error.message }

  revalidatePath('/staff')
  return { success: true }
}

export async function removeStaffAction(userStoreId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_stores')
    .delete()
    .eq('id', userStoreId)

  if (error) return { error: error.message }

  revalidatePath('/staff')
  return { success: true }
}
