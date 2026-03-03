'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { productServerSchema } from '@/lib/validations/product'

export async function getProducts(storeId: string, search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .is('deleted_at', null)
    .order('name')

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getProduct(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProductAction(formData: FormData) {
  const supabase = await createClient()

  const raw = {
    store_id: formData.get('store_id') as string,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    sku: formData.get('sku') as string,
    price: formData.get('price') as string,
    cost: formData.get('cost') as string,
    quantity_in_stock: formData.get('quantity_in_stock') as string,
    low_stock_threshold: formData.get('low_stock_threshold') as string,
    category: formData.get('category') as string,
    is_active: formData.get('is_active') === 'true',
  }

  const result = productServerSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const insertData = {
    ...result.data,
    cost: result.data.cost || null,
  }

  const { data, error } = await supabase
    .from('products')
    .insert(insertData)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/products')
  return { data }
}

export async function updateProductAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const raw = {
    store_id: formData.get('store_id') as string,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    sku: formData.get('sku') as string,
    price: formData.get('price') as string,
    cost: formData.get('cost') as string,
    quantity_in_stock: formData.get('quantity_in_stock') as string,
    low_stock_threshold: formData.get('low_stock_threshold') as string,
    category: formData.get('category') as string,
    is_active: formData.get('is_active') === 'true',
  }

  const result = productServerSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const updateData = {
    ...result.data,
    cost: result.data.cost || null,
  }

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/products')
  return { data }
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/products')
  return { success: true }
}

export async function adjustStockAction(id: string, adjustment: number) {
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('quantity_in_stock')
    .eq('id', id)
    .single()

  if (!product) return { error: 'Product not found' }

  const newQuantity = Math.max(0, product.quantity_in_stock + adjustment)

  const { error } = await supabase
    .from('products')
    .update({ quantity_in_stock: newQuantity })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/products')
  return { success: true, newQuantity }
}
