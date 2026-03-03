'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { membershipPlanSchema } from '@/lib/validations/membership'

export async function getMembershipPlans(storeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('store_id', storeId)
    .order('sort_order')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getMembershipPlan(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createMembershipPlanAction(formData: FormData) {
  const supabase = await createClient()

  const raw = {
    store_id: formData.get('store_id') as string,
    name: formData.get('name') as string,
    shortcode: formData.get('shortcode') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    billing_period: formData.get('billing_period') as string,
    haircuts_included: formData.get('haircuts_included') as string,
    discount_percentage: formData.get('discount_percentage') as string,
    is_active: formData.get('is_active') === 'true',
    sort_order: formData.get('sort_order') as string,
  }

  const result = membershipPlanSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { data, error } = await supabase
    .from('membership_plans')
    .insert(result.data)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/memberships')
  return { data }
}

export async function updateMembershipPlanAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const raw = {
    store_id: formData.get('store_id') as string,
    name: formData.get('name') as string,
    shortcode: formData.get('shortcode') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    billing_period: formData.get('billing_period') as string,
    haircuts_included: formData.get('haircuts_included') as string,
    discount_percentage: formData.get('discount_percentage') as string,
    is_active: formData.get('is_active') === 'true',
    sort_order: formData.get('sort_order') as string,
  }

  const result = membershipPlanSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { data, error } = await supabase
    .from('membership_plans')
    .update(result.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/memberships')
  return { data }
}

export async function deleteMembershipPlanAction(id: string) {
  const supabase = await createClient()

  // Check if plan has active memberships
  const { count } = await supabase
    .from('client_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('plan_id', id)
    .eq('status', 'active')

  if (count && count > 0) {
    return { error: 'Cannot delete plan with active memberships' }
  }

  const { error } = await supabase
    .from('membership_plans')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/memberships')
  return { success: true }
}

export async function toggleMembershipPlanActiveAction(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('membership_plans')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/memberships')
  return { success: true }
}
