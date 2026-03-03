# Supabase Patterns - YesWeDo

Patrones y snippets para trabajar con Supabase en el proyecto.

## Clientes Supabase

### Server Client
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component
          }
        },
      },
    }
  )
}
```

### Browser Client
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Admin Client (Service Role)
```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

## Queries Multi-Tenant

### Siempre filtrar por store_id
```typescript
// ✅ Correcto
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('store_id', storeId)

// ❌ Incorrecto - expone datos de otras tiendas
const { data } = await supabase
  .from('clients')
  .select('*')
```

### Helper para store context
```typescript
// lib/supabase/helpers.ts
export async function getCurrentStore() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: userStore } = await supabase
    .from('user_stores')
    .select('store_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  return userStore?.store_id
}
```

## RLS Policies

### Template básico
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Select: solo datos de tu store
CREATE POLICY "Users can view their store data"
ON table_name FOR SELECT
USING (
  store_id IN (
    SELECT store_id FROM user_stores WHERE user_id = auth.uid()
  )
);

-- Insert: solo en tu store
CREATE POLICY "Users can insert in their store"
ON table_name FOR INSERT
WITH CHECK (
  store_id IN (
    SELECT store_id FROM user_stores WHERE user_id = auth.uid()
  )
);

-- Update: solo tus datos
CREATE POLICY "Users can update their store data"
ON table_name FOR UPDATE
USING (
  store_id IN (
    SELECT store_id FROM user_stores WHERE user_id = auth.uid()
  )
);

-- Delete: solo tus datos
CREATE POLICY "Users can delete their store data"
ON table_name FOR DELETE
USING (
  store_id IN (
    SELECT store_id FROM user_stores WHERE user_id = auth.uid()
  )
);
```

## Realtime

```typescript
// hooks/use-realtime.ts
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeClients(storeId: string, onUpdate: () => void) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `store_id=eq.${storeId}`,
        },
        () => onUpdate()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeId, onUpdate])
}
```

## Storage

```typescript
// Upload avatar
async function uploadAvatar(file: File, userId: string) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `avatars/${userId}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
```

## Edge Functions

```typescript
// supabase/functions/process-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { amount, customerId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Process payment...

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Tipos Generados

```bash
# Generar tipos desde schema
npx supabase gen types typescript --local > src/types/database.ts

# Usar en código
import type { Database } from '@/types/database'

type Client = Database['public']['Tables']['clients']['Row']
type ClientInsert = Database['public']['Tables']['clients']['Insert']
```
