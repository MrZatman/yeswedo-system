'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface ClientMembershipWithPlan {
  id: string
  client_id: string
  plan_id: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  start_date: string
  end_date: string | null
  visits_used: number
  visits_remaining: number
  created_at: string
  plan: {
    id: string
    name: string
    shortcode: string
    price: number
    billing_period: string
    haircuts_included: number
  }
}

export async function getClientMemberships(clientId: string): Promise<ClientMembershipWithPlan[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_memberships')
    .select(`
      *,
      plan:membership_plans(id, name, shortcode, price, billing_period, haircuts_included)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map(item => ({
    ...item,
    plan: Array.isArray(item.plan) ? item.plan[0] : item.plan,
  })) as ClientMembershipWithPlan[]
}

export async function getActiveClientMembership(clientId: string): Promise<ClientMembershipWithPlan | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_memberships')
    .select(`
      *,
      plan:membership_plans(id, name, shortcode, price, billing_period, haircuts_included)
    `)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null

  return {
    ...data,
    plan: Array.isArray(data.plan) ? data.plan[0] : data.plan,
  } as ClientMembershipWithPlan
}

export async function assignMembershipAction(formData: FormData) {
  const supabase = await createClient()

  const clientId = formData.get('client_id') as string
  const planId = formData.get('plan_id') as string
  const storeId = formData.get('store_id') as string

  if (!clientId || !planId || !storeId) {
    return { error: 'Missing required fields' }
  }

  // Check if client already has active membership
  const { data: existing } = await supabase
    .from('client_memberships')
    .select('id')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  if (existing) {
    return { error: 'Client already has an active membership. Cancel it first.' }
  }

  // Get plan details for visits
  const { data: plan } = await supabase
    .from('membership_plans')
    .select('haircuts_included')
    .eq('id', planId)
    .single()

  const today = new Date()
  const endDate = new Date(today)
  endDate.setMonth(endDate.getMonth() + 1) // Default 1 month

  const { data, error } = await supabase
    .from('client_memberships')
    .insert({
      store_id: storeId,
      client_id: clientId,
      plan_id: planId,
      status: 'active',
      start_date: today.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      visits_used: 0,
      visits_remaining: plan?.haircuts_included ?? 0,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/clients/${clientId}`)
  return { data }
}

export async function cancelMembershipAction(membershipId: string, clientId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('client_memberships')
    .update({ status: 'cancelled' })
    .eq('id', membershipId)

  if (error) return { error: error.message }

  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}

export async function pauseMembershipAction(membershipId: string, clientId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('client_memberships')
    .update({ status: 'paused' })
    .eq('id', membershipId)

  if (error) return { error: error.message }

  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}

export async function resumeMembershipAction(membershipId: string, clientId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('client_memberships')
    .update({ status: 'active' })
    .eq('id', membershipId)

  if (error) return { error: error.message }

  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}

export async function useVisitAction(membershipId: string, clientId: string) {
  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('client_memberships')
    .select('visits_used, visits_remaining')
    .eq('id', membershipId)
    .single()

  if (!membership) return { error: 'Membership not found' }

  const { error } = await supabase
    .from('client_memberships')
    .update({
      visits_used: membership.visits_used + 1,
      visits_remaining: Math.max(0, membership.visits_remaining - 1),
    })
    .eq('id', membershipId)

  if (error) return { error: error.message }

  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}
